import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { conditionOptions } from '../configs';
import { ergonomicNonword3CharAllConfig } from '../configs/ergonomicNonword3Char';
import { alphabetSize } from '../core/alphabet';
import { SessionEngine, type SessionSnapshot } from '../core/session';
import { KeyboardHandler } from '../input/KeyboardHandler';
import { completeUpload, isLocalMode, retryPendingLogs } from '../logging/LogUploader';
import { SessionLogger } from '../logging/SessionLogger';
import type { BitRatePoint, RuntimeMode, SessionConfig, SessionLog, TargetPresentation, UploadStatus } from '../types';
import { AdminDashboard } from './AdminDashboard';
import { ConsentScreen } from './ConsentScreen';
import { EndScreen } from './EndScreen';
import { GameScreen, type TargetError } from './GameScreen';
import { StartScreen } from './StartScreen';

type Stage = 'consent' | 'start' | 'scored' | 'ended';

const SUBJECT_ID_PATTERN = /^[A-Za-z0-9 _-]{1,20}$/;
const ERROR_INPUT_LOCKOUT_MS = 150;
const FINAL_CONDITION_ID = 'three_char_ergonomic_nonwords_n16009';
const finalConditionOption = {
  label: '3-char non-words (N=16009)',
  config: ergonomicNonword3CharAllConfig
};

export function App(): JSX.Element {
  const isAdminRoute = window.location.pathname === '/admin' || window.location.hash === '#/admin';
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  const isUxTestRoute = window.location.pathname === '/uxtest' || window.location.hash === '#/uxtest';
  const activeConditionOptions = isUxTestRoute ? conditionOptions : [finalConditionOption];
  const mode = useMemo<RuntimeMode>(() => isLocalMode() ? 'local' : 'remote', []);
  const [stage, setStage] = useState<Stage>(isUxTestRoute && mode === 'remote' ? 'consent' : 'start');
  const [selectedConditionId, setSelectedConditionId] = useState(
    isUxTestRoute ? conditionOptions[0].config.condition_id : FINAL_CONDITION_ID
  );
  const [requireSpace, setRequireSpace] = useState(true);
  const [subjectId, setSubjectId] = useState(mode === 'remote' ? '' : 'anon');
  const [subjectIdError, setSubjectIdError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [targetErrors, setTargetErrors] = useState<Record<number, TargetError>>({});
  const [finalLog, setFinalLog] = useState<SessionLog | null>(null);
  const [bitRatePoints, setBitRatePoints] = useState<BitRatePoint[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ state: 'idle' });
  const [retryBanner, setRetryBanner] = useState<string | null>(null);

  const engineRef = useRef<SessionEngine | null>(null);
  const handlerRef = useRef<KeyboardHandler | null>(null);
  const loggerRef = useRef<SessionLogger | null>(null);
  const pendingScoredTargetsRef = useRef<TargetPresentation[]>([]);
  const suppressUntilFrameRef = useRef(false);
  const ignoreInputUntilMsRef = useRef(0);
  const uploadedSessionRef = useRef<string | null>(null);

  const selectedConfig = useMemo(
    () => activeConditionOptions.find((option) => option.config.condition_id === selectedConditionId)?.config
      ?? activeConditionOptions[0].config,
    [activeConditionOptions, selectedConditionId]
  );

  useEffect(() => {
    if (mode !== 'remote') {
      return;
    }
    void retryPendingLogs().then((result) => {
      if (result.failed > 0) {
        setRetryBanner(`${result.failed} prior session log${result.failed === 1 ? '' : 's'} could not be uploaded. They remain saved locally and will retry after a future session.`);
      }
    });
  }, [mode]);

  useEffect(() => {
    if (stage !== 'scored') {
      return;
    }

    const handler = new KeyboardHandler();
    handlerRef.current = handler;
    handler.start((event) => {
      if (suppressUntilFrameRef.current) {
        return;
      }

      if (event.timestamp_ms < ignoreInputUntilMsRef.current) {
        return;
      }

      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      const result = engine.handleInput(event);
      if (result.ignored) {
        return;
      }

      if (stage === 'scored') {
        ensureLoggerStarted(selectedConfig, subjectIdForLog(), result.started);
        if (result.loggedInput) {
          loggerRef.current?.recordInput(result.loggedInput);
        }
        if (result.targetPresentation) {
          loggerRef.current?.recordTarget(result.targetPresentation);
        }
      }

      if (result.targetPresentation) {
        handler.expectsTarget(result.targetPresentation.target);
        if (result.selectionCorrect === false && result.failedTarget !== undefined && result.failedIndex !== undefined) {
          ignoreInputUntilMsRef.current = event.timestamp_ms + ERROR_INPUT_LOCKOUT_MS;
          const failedTargetIndex = result.targetPresentation.index - 1;
          const failedTarget = result.failedTarget;
          const failedIndex = result.failedIndex;
          setTargetErrors((errors) => ({
            ...errors,
            [failedTargetIndex]: {
              targetIndex: failedTargetIndex,
              target: failedTarget,
              errorIndex: failedIndex
            }
          }));
        }
        suppressUntilFrameRef.current = true;
        requestAnimationFrame(() => {
          suppressUntilFrameRef.current = false;
        });
      }

      flushSync(() => {
        setSnapshot(engine.getSnapshot(event.timestamp_ms));
      });
    });

    return () => {
      handler.stop();
      handlerRef.current = null;
    };
  }, [selectedConfig, stage, subjectId]);

  useEffect(() => {
    if (stage !== 'scored') {
      return;
    }

    const interval = window.setInterval(() => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      const now = performance.now();
      const current = engine.getSnapshot(now);
      setSnapshot(current);

      if (stage === 'scored' && current.started) {
        setBitRatePoints((points) => [...points, engine.getBitRatePoint(now)]);
      }

      if (current.started && current.elapsedSeconds >= engine.config.duration_seconds) {
        engine.forceComplete();
        finishScored(engine, now);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [selectedConfig, stage]);

  useEffect(() => {
    if (mode !== 'remote' || !finalLog || uploadedSessionRef.current === finalLog.session_id) {
      return;
    }
    uploadedSessionRef.current = finalLog.session_id;
    setUploadStatus({ state: 'pending' });
    void completeUpload(finalLog).then((result) => {
      if (result.ok) {
        setUploadStatus({ state: 'success' });
      } else {
        setUploadStatus({ state: 'failed', message: result.error, fallback_available: true });
      }
    });
  }, [finalLog, mode]);

  const start = (): void => {
    const normalizedSubjectId = subjectId.trim();
    if (mode === 'remote' && !SUBJECT_ID_PATTERN.test(normalizedSubjectId)) {
      setSubjectIdError('Subject ID is required in remote mode: 1-20 letters, numbers, spaces, hyphens, or underscores.');
      return;
    }
    setSubjectIdError(null);
    setFinalLog(null);
    setTargetErrors({});
    setBitRatePoints([]);
    setUploadStatus({ state: 'idle' });
    uploadedSessionRef.current = null;
    ignoreInputUntilMsRef.current = 0;
    loggerRef.current = null;
    pendingScoredTargetsRef.current = [];

    startScored({
      ...selectedConfig,
      display: {
        ...selectedConfig.display,
        require_space: requireSpace
      }
    });
  };

  const startScored = (config: SessionConfig): void => {
    const engine = new SessionEngine(config);
    const firstTarget = engine.initialize(performance.now());
    pendingScoredTargetsRef.current = [firstTarget];
    loggerRef.current = null;
    engineRef.current = engine;
    handlerRef.current?.expectsTarget(firstTarget.target);
    setBitRatePoints([]);
    setTargetErrors({});
    setSnapshot(engine.getSnapshot(performance.now()));
    setStage('scored');
  };

  const finishScored = (engine: SessionEngine, now: number): void => {
    let logger = loggerRef.current;
    if (!logger) {
      logger = new SessionLogger(subjectIdForLog(), selectedConfig);
      for (const target of pendingScoredTargetsRef.current) {
        logger.recordTarget(target);
      }
      loggerRef.current = logger;
    }

    const counts = engine.getCounts();
    const final: SessionLog['final'] = {
      N: alphabetSize(selectedConfig),
      Sc: counts.Sc,
      Si: counts.Si,
      bit_rate_bps: engine.finalBitRate(now)
    };
    const point = engine.getBitRatePoint(now);
    setBitRatePoints((points) => [...points, point]);
    setFinalLog(logger.finalize(final));
    setStage('ended');
  };

  const endRunNow = (): void => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const now = performance.now();
    engine.forceComplete();
    finishScored(engine, now);
  };

  const ensureLoggerStarted = (config: SessionConfig, normalizedSubjectId: string, inputStarted: boolean): void => {
    if (!inputStarted || loggerRef.current) {
      return;
    }
    const logger = new SessionLogger(normalizedSubjectId, config);
    for (const target of pendingScoredTargetsRef.current) {
      logger.recordTarget(target);
    }
    loggerRef.current = logger;
  };

  const subjectIdForLog = useCallback((): string => {
    const trimmed = subjectId.trim();
    return trimmed === '' ? 'anon' : trimmed;
  }, [subjectId]);

  const downloadLog = (): void => {
    if (!finalLog) {
      return;
    }
    const blob = new Blob([JSON.stringify(finalLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${finalLog.session_id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const retryUpload = (): void => {
    if (!finalLog) {
      return;
    }
    setUploadStatus({ state: 'pending' });
    void completeUpload(finalLog).then((result) => {
      setUploadStatus(result.ok
        ? { state: 'success' }
        : { state: 'failed', message: result.error, fallback_available: true });
    });
  };

  if (stage === 'consent') {
    return <ConsentScreen onContinue={() => setStage('start')} />;
  }

  if (stage === 'start') {
    return (
      <StartScreen
        mode={mode}
        conditionOptions={activeConditionOptions}
        selectedConditionId={selectedConditionId}
        subjectId={subjectId}
        requireSpace={requireSpace}
        retryBanner={retryBanner}
        showConditionPicker={isUxTestRoute}
        showRequireSpaceToggle={isUxTestRoute}
        showAudit={isUxTestRoute}
        onConditionChange={setSelectedConditionId}
        onSubjectIdChange={(value) => {
          setSubjectId(value);
          setSubjectIdError(null);
        }}
        onRequireSpaceChange={setRequireSpace}
        onStart={start}
        subjectIdError={subjectIdError}
      />
    );
  }

  if (stage === 'scored' && snapshot) {
    return (
      <GameScreen
        snapshot={snapshot}
        targetErrors={targetErrors}
        onEnd={endRunNow}
      />
    );
  }

  if (stage === 'ended' && finalLog) {
    return (
      <EndScreen
        log={finalLog}
        points={bitRatePoints}
        mode={mode}
        uploadStatus={uploadStatus}
        onDownload={downloadLog}
        onRetryUpload={retryUpload}
        onRestart={() => setStage('start')}
      />
    );
  }

  return <main className="panel">Loading...</main>;
}
