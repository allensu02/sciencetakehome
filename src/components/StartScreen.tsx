import { useEffect, useState } from 'react';
import type { AuditResult } from '../audit/audit';
import { runIidAudit } from '../audit/audit';
import type { ConditionOption } from '../configs';
import type { RuntimeMode, SessionConfig } from '../types';

type StartScreenProps = {
  mode: RuntimeMode;
  conditionOptions: ConditionOption[];
  selectedConditionId: string;
  subjectId: string;
  requireSpace: boolean;
  retryBanner: string | null;
  showConditionPicker?: boolean;
  showRequireSpaceToggle?: boolean;
  showAudit?: boolean;
  onConditionChange: (conditionId: string) => void;
  onSubjectIdChange: (subjectId: string) => void;
  onRequireSpaceChange: (enabled: boolean) => void;
  onStart: () => void;
  subjectIdError: string | null;
};

export function StartScreen({
  mode,
  conditionOptions,
  selectedConditionId,
  subjectId,
  requireSpace,
  retryBanner,
  showConditionPicker = true,
  showRequireSpaceToggle = true,
  showAudit = true,
  onConditionChange,
  onSubjectIdChange,
  onRequireSpaceChange,
  onStart,
  subjectIdError
}: StartScreenProps): JSX.Element {
  const selectedConfig = conditionOptions.find((option) => option.config.condition_id === selectedConditionId)?.config
    ?? conditionOptions[0].config;

  const runAudit = (): void => {
    const result = runIidAudit(selectedConfig);
    window.dispatchEvent(new CustomEvent<AuditResult>('audit-result', { detail: result }));
  };

  return (
    <main className="panel start">
      {retryBanner && <div className="banner warning">{retryBanner}</div>}
      <p className="eyebrow">60-second evaluation</p>
      <h1>BCI bit-rate typing task</h1>
      <p className="lead">
        Timer starts on your first keystroke. Targets are sampled i.i.d. uniform with replacement.
      </p>

      {showConditionPicker && (
        <fieldset className="conditions">
          <legend>Condition</legend>
          {conditionOptions.map((option, index) => (
            <label className="condition" key={option.config.condition_id}>
              <input
                type="radio"
                name="condition"
                value={option.config.condition_id}
                checked={option.config.condition_id === selectedConditionId}
                onChange={() => onConditionChange(option.config.condition_id)}
              />
              <span>{index + 1}. {option.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      <label className="field">
        <span>Subject ID {mode === 'remote' ? '(required)' : ''}</span>
        <input
          value={subjectId}
          maxLength={20}
          onChange={(event) => onSubjectIdChange(event.target.value)}
          placeholder={mode === 'remote' ? 'e.g. subject-01' : 'anon'}
        />
      </label>
      {subjectIdError && <p className="error">{subjectIdError}</p>}

      {showRequireSpaceToggle && (
        <label className="toggle-row">
          <span>
            <strong>Press space</strong>
            <small>Require Space after each target to advance.</small>
          </span>
          <input
            type="checkbox"
            checked={requireSpace}
            onChange={(event) => onRequireSpaceChange(event.target.checked)}
          />
        </label>
      )}

      <div className="actions">
        <button className="primary" onClick={onStart}>Start</button>
        {showAudit && <button className="secondary" onClick={runAudit}>Run i.i.d. audit</button>}
      </div>

      {showAudit && <AuditOutput selectedConfig={selectedConfig} />}
    </main>
  );
}

function AuditOutput({ selectedConfig }: { selectedConfig: SessionConfig }): JSX.Element {
  const [result, setResult] = useAuditResult();

  return (
    <section className="audit">
      <h2>Audit output</h2>
      {result ? (
        <p>
          {selectedConfig.condition_id}: draws={result.draws.toLocaleString()}, N={result.alphabetSize},
          chi-squared={result.chiSquared.toFixed(2)}, lag-1 r={result.lag1Correlation.toFixed(4)},
          count range={result.minCount}-{result.maxCount}
        </p>
      ) : (
        <p className="muted">Audit results appear here and in the console.</p>
      )}
    </section>
  );
}

function useAuditResult(): [AuditResult | null, (result: AuditResult | null) => void] {
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    const listener = (event: Event): void => {
      setResult((event as CustomEvent<AuditResult>).detail);
    };
    window.addEventListener('audit-result', listener);
    return () => window.removeEventListener('audit-result', listener);
  }, []);

  return [result, setResult];
}
