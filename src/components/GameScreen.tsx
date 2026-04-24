import { useEffect, useMemo, useRef, useState } from 'react';
import type { SessionSnapshot } from '../core/session';

export type TargetError = {
  targetIndex: number;
  target: string;
  errorIndex: number;
};

type GameScreenProps = {
  snapshot: SessionSnapshot;
  targetErrors: Record<number, TargetError>;
  onEnd: () => void;
};

type StreamWord = {
  targetIndex: number;
  key: string;
  target: string;
  kind: 'previous' | 'failed' | 'current' | 'upcoming';
  errorIndex?: number;
};

const APPROX_CHAR_WIDTH_EM = 0.66;
const WORD_GAP_EM = 0.68;

export function GameScreen({ snapshot, targetErrors, onEnd }: GameScreenProps): JSX.Element {
  const [hiddenPreviousCount, setHiddenPreviousCount] = useState(0);
  const [streamWidthPx, setStreamWidthPx] = useState(0);
  const [fontSizePx, setFontSizePx] = useState(48);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const previousCountRef = useRef(snapshot.previousTargets.length);

  useEffect(() => {
    if (snapshot.previousTargets.length < previousCountRef.current) {
      setHiddenPreviousCount(0);
    }
    previousCountRef.current = snapshot.previousTargets.length;
  }, [snapshot.previousTargets.length]);

  const firstPreviousIndex = snapshot.currentTargetIndex - snapshot.previousTargets.length;
  const visiblePreviousTargets = snapshot.previousTargets.slice(hiddenPreviousCount);
  const words: StreamWord[] = [
    ...visiblePreviousTargets.map((target, index) => ({
      targetIndex: firstPreviousIndex + hiddenPreviousCount + index,
      key: `previous-${firstPreviousIndex + hiddenPreviousCount + index}`,
      target,
      kind: targetErrors[firstPreviousIndex + hiddenPreviousCount + index] ? 'failed' as const : 'previous' as const,
      errorIndex: targetErrors[firstPreviousIndex + hiddenPreviousCount + index]?.errorIndex
    })),
    {
      targetIndex: snapshot.currentTargetIndex,
      key: `current-${snapshot.currentTargetIndex}`,
      target: snapshot.currentTarget,
      kind: 'current' as const,
      errorIndex: undefined
    },
    ...snapshot.upcomingTargets.slice(0, 140).map((target, index) => ({
      targetIndex: snapshot.currentTargetIndex + index + 1,
      key: `upcoming-${snapshot.currentTargetIndex}-${index}`,
      target,
      kind: 'upcoming' as const,
      errorIndex: undefined
    }))
  ];

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) {
      return;
    }

    const updateMeasurement = (): void => {
      const styles = window.getComputedStyle(stream);
      setStreamWidthPx(stream.clientWidth);
      setFontSizePx(Number.parseFloat(styles.fontSize) || 48);
    };

    updateMeasurement();
    const resizeObserver = new ResizeObserver(updateMeasurement);
    resizeObserver.observe(stream);
    return () => resizeObserver.disconnect();
  }, []);

  const rows = useMemo(() => buildRows(words, streamWidthPx, fontSizePx), [fontSizePx, streamWidthPx, words]);
  const currentRowIndex = rows.findIndex((row) => row.some((word) => word.kind === 'current'));

  useEffect(() => {
    if (currentRowIndex < 2) {
      return;
    }

    const firstRowPreviousItems = rows[0]?.filter((word) => word.kind === 'previous' || word.kind === 'failed') ?? [];

    if (firstRowPreviousItems.length > 0) {
      setHiddenPreviousCount((count) => Math.min(count + firstRowPreviousItems.length, snapshot.previousTargets.length));
    }
  }, [currentRowIndex, rows, snapshot.previousTargets.length]);

  return (
    <main className="game">
      <div className="hud bitrate">{snapshot.bitRateBps.toFixed(2)} bps</div>
      {!snapshot.started && <div className="ready">Press the first key to start the timer</div>}
      <button className="end-run-button" onClick={onEnd}>end</button>
      <div className="typing-stage">
        <div className="stream-timer">{formatSeconds(snapshot.remainingSeconds)}</div>
        <section className="word-stream" ref={streamRef} aria-label="Target stream">
          {rows.slice(0, 3).map((row, rowIndex) => (
            <div className="word-row" key={`row-${rowIndex}`}>
              {row.map((word) => (
                <span className={`word-item ${word.kind}`} key={word.key}>
                  <WordToken
                    target={word.target}
                    kind={word.kind}
                    buffer={word.kind === 'current' ? snapshot.buffer : ''}
                    errorIndex={word.errorIndex}
                  />
                </span>
              ))}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function WordToken({
  target,
  kind,
  buffer,
  errorIndex
}: {
  target: string;
  kind: 'previous' | 'failed' | 'current' | 'upcoming';
  buffer: string;
  errorIndex?: number;
}): JSX.Element {
  if (kind === 'failed') {
    const index = errorIndex ?? 0;
    return (
      <span className="word-token failed">
        <span>{target.slice(0, index)}</span>
        <span className="error-letter">{target.slice(index, index + 1)}</span>
        <span>{target.slice(index + 1)}</span>
      </span>
    );
  }

  if (kind !== 'current') {
    return <span className={`word-token ${kind}`}>{target}</span>;
  }

  const typed = target.slice(0, buffer.length);
  const remaining = target.slice(buffer.length);

  return (
    <span className="word-token current">
      <span className="typed">{typed}</span>
      <span className="cursor-slot">
        {remaining.slice(0, 1)}
      </span>
      <span>{remaining.slice(1)}</span>
    </span>
  );
}

function formatSeconds(seconds: number): string {
  return Math.ceil(seconds).toString().padStart(2, '0');
}

function buildRows(words: StreamWord[], streamWidthPx: number, fontSizePx: number): StreamWord[][] {
  if (streamWidthPx <= 0) {
    return [words];
  }

  const maxWidthEm = streamWidthPx / fontSizePx;
  const rows: StreamWord[][] = [];
  let currentRow: StreamWord[] = [];
  let currentWidthEm = 0;

  for (const word of words) {
    const wordWidthEm = word.target.length * APPROX_CHAR_WIDTH_EM;
    const nextWidthEm = currentRow.length === 0
      ? wordWidthEm
      : currentWidthEm + WORD_GAP_EM + wordWidthEm;

    if (currentRow.length > 0 && nextWidthEm > maxWidthEm) {
      rows.push(currentRow);
      currentRow = [word];
      currentWidthEm = wordWidthEm;
    } else {
      currentRow.push(word);
      currentWidthEm = nextWidthEm;
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}
