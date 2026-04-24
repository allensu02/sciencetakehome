import type { LoggedInput, SessionConfig, SessionLog, TargetPresentation } from '../types';

export class SessionLogger {
  private readonly targets: TargetPresentation[] = [];
  private readonly inputs: LoggedInput[] = [];
  private readonly sessionId: string;
  private readonly startedAtIso: string;

  constructor(
    private readonly subjectId: string,
    private readonly config: SessionConfig
  ) {
    this.sessionId = crypto.randomUUID();
    this.startedAtIso = new Date().toISOString();
  }

  get id(): string {
    return this.sessionId;
  }

  recordTarget(target: TargetPresentation): void {
    this.targets.push(target);
  }

  recordInput(input: LoggedInput): void {
    this.inputs.push(input);
  }

  finalize(final: SessionLog['final']): SessionLog {
    return {
      session_id: this.sessionId,
      subject_id: this.subjectId,
      condition_id: this.config.condition_id,
      config: this.config,
      started_at: this.startedAtIso,
      duration_s: this.config.duration_seconds,
      targets: [...this.targets],
      inputs: [...this.inputs],
      final
    };
  }
}
