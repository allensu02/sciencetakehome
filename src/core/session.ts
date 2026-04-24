import { drawUniform } from './rng';
import type { BitRatePoint, InputEvent, LoggedInput, SessionConfig, TargetPresentation } from '../types';

export type SessionSnapshot = {
  currentTarget: string;
  currentTargetIndex: number;
  previousTargets: string[];
  upcomingTargets: string[];
  buffer: string;
  started: boolean;
  complete: boolean;
  elapsedSeconds: number;
  remainingSeconds: number;
  Sc: number;
  Si: number;
  bitRateBps: number;
};

export type InputResult = {
  ignored: boolean;
  started: boolean;
  completed: boolean;
  sessionEnded: boolean;
  selectionCorrect?: boolean;
  failedTarget?: string;
  failedIndex?: number;
  loggedInput?: LoggedInput;
  targetPresentation?: TargetPresentation;
};

export class SessionEngine {
  readonly config: SessionConfig;

  private target = '';
  private targetIndex = -1;
  private readonly previousTargets: string[] = [];
  private readonly upcomingTargets: string[] = [];
  private buffer = '';
  private correctSelections = 0;
  private incorrectSelections = 0;
  private startedAtMs: number | null = null;
  private completed = false;

  constructor(config: SessionConfig) {
    if (config.alphabet.length < 3) {
      throw new Error('Alphabet size must be at least 3');
    }
    this.config = config;
  }

  initialize(nowMs: number): TargetPresentation {
    this.ensureUpcomingTargets();
    return this.presentNextTarget(nowMs);
  }

  getSnapshot(nowMs: number): SessionSnapshot {
    const elapsedSeconds = this.elapsedSeconds(nowMs);
    const remainingSeconds = this.startedAtMs === null
      ? this.config.duration_seconds
      : Math.max(this.config.duration_seconds - elapsedSeconds, 0);

    return {
      currentTarget: this.target,
      currentTargetIndex: this.targetIndex,
      previousTargets: [...this.previousTargets],
      upcomingTargets: [...this.upcomingTargets],
      buffer: this.buffer,
      started: this.startedAtMs !== null,
      complete: this.completed,
      elapsedSeconds,
      remainingSeconds,
      Sc: this.correctSelections,
      Si: this.incorrectSelections,
      bitRateBps: this.bitRate(elapsedSeconds)
    };
  }

  getBitRatePoint(nowMs: number): BitRatePoint {
    const snapshot = this.getSnapshot(nowMs);
    return {
      elapsed_s: snapshot.elapsedSeconds,
      bit_rate_bps: snapshot.bitRateBps,
      Sc: snapshot.Sc,
      Si: snapshot.Si
    };
  }

  handleInput(event: InputEvent): InputResult {
    if (this.completed || this.target === '') {
      return { ignored: true, started: false, completed: false, sessionEnded: this.completed };
    }

    let started = false;
    if (this.startedAtMs === null) {
      this.startedAtMs = event.timestamp_ms;
      started = true;
    }

    if (this.elapsedSeconds(event.timestamp_ms) >= this.config.duration_seconds) {
      this.completed = true;
      return { ignored: true, started, completed: false, sessionEnded: true };
    }

    const expected = this.target[this.buffer.length];
    const isCorrectSymbol = event.symbol === expected;

    if (!isCorrectSymbol && this.config.scoring.advance_on_error) {
      const failedTarget = this.target;
      const failedIndex = this.buffer.length;
      this.incorrectSelections += 1;
      const loggedInput: LoggedInput = {
        symbol: event.symbol,
        timestamp_ms: event.timestamp_ms,
        target_index: this.targetIndex,
        correct: false,
        selection_complete: true,
        selection_correct: false
      };
      this.buffer = '';
      const targetPresentation = this.presentNextTarget(event.timestamp_ms);
      return {
        ignored: false,
        started,
        completed: true,
        sessionEnded: false,
        selectionCorrect: false,
        failedTarget,
        failedIndex,
        loggedInput,
        targetPresentation
      };
    }

    if (!isCorrectSymbol) {
      const loggedInput: LoggedInput = {
        symbol: event.symbol,
        timestamp_ms: event.timestamp_ms,
        target_index: this.targetIndex,
        correct: false,
        selection_complete: false
      };
      return { ignored: false, started, completed: false, sessionEnded: false, loggedInput };
    }

    this.buffer += event.symbol;
    const selectionComplete = this.buffer === this.target;
    const loggedInput: LoggedInput = {
      symbol: event.symbol,
      timestamp_ms: event.timestamp_ms,
      target_index: this.targetIndex,
      correct: true,
      selection_complete: selectionComplete,
      selection_correct: selectionComplete ? true : undefined
    };

    if (!selectionComplete) {
      return { ignored: false, started, completed: false, sessionEnded: false, loggedInput };
    }

    this.correctSelections += 1;
    this.buffer = '';
    const targetPresentation = this.presentNextTarget(event.timestamp_ms);
    return { ignored: false, started, completed: true, sessionEnded: false, selectionCorrect: true, loggedInput, targetPresentation };
  }

  forceComplete(): void {
    this.completed = true;
  }

  finalBitRate(nowMs: number): number {
    return this.bitRate(Math.min(this.elapsedSeconds(nowMs), this.config.duration_seconds));
  }

  getCounts(): { Sc: number; Si: number } {
    return { Sc: this.correctSelections, Si: this.incorrectSelections };
  }

  private presentNextTarget(nowMs: number): TargetPresentation {
    if (this.target) {
      this.previousTargets.push(this.target);
    }
    this.ensureUpcomingTargets();
    this.target = this.upcomingTargets.shift() ?? drawUniform(this.config.alphabet);
    this.ensureUpcomingTargets();
    this.targetIndex += 1;
    return {
      index: this.targetIndex,
      target: this.target,
      shown_at_ms: nowMs
    };
  }

  private ensureUpcomingTargets(): void {
    while (this.upcomingTargets.length < 160) {
      this.upcomingTargets.push(drawUniform(this.config.alphabet));
    }
  }

  private elapsedSeconds(nowMs: number): number {
    if (this.startedAtMs === null) {
      return 0;
    }
    return Math.max((nowMs - this.startedAtMs) / 1000, 0);
  }

  private bitRate(elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) {
      return 0;
    }
    const netCorrect = Math.max(this.correctSelections - this.incorrectSelections, 0);
    return Math.log2(this.config.alphabet.length - 1) * netCorrect / elapsedSeconds;
  }
}
