export type InputModality = 'keyboard' | 'voice' | 'head_tracking';

export type RuntimeMode = 'local' | 'remote';

export type SessionConfig = {
  condition_id: string;
  alphabet: string[];
  input_modality: InputModality;
  scoring: {
    mode: 'exact_match';
    advance_on_error: boolean;
  };
  display: {
    show_current_target: boolean;
    show_next_target: boolean;
    show_keyboard_overlay: boolean;
    require_space: boolean;
  };
  duration_seconds: number;
  familiarization_seconds: number;
};

export type InputEvent = {
  symbol: string;
  timestamp_ms: number;
};

export type TargetPresentation = {
  index: number;
  target: string;
  shown_at_ms: number;
};

export type LoggedInput = {
  symbol: string;
  timestamp_ms: number;
  target_index: number;
  correct: boolean;
  selection_complete: boolean;
  selection_correct?: boolean;
};

export type SessionLog = {
  session_id: string;
  subject_id: string;
  condition_id: string;
  config: SessionConfig;
  started_at: string;
  duration_s: number;
  targets: TargetPresentation[];
  inputs: LoggedInput[];
  final: {
    N: number;
    Sc: number;
    Si: number;
    bit_rate_bps: number;
  };
};

export type BitRatePoint = {
  elapsed_s: number;
  bit_rate_bps: number;
  Sc: number;
  Si: number;
};

export type UploadStatus =
  | { state: 'idle' }
  | { state: 'pending' }
  | { state: 'success' }
  | { state: 'failed'; message: string; fallback_available: boolean };

export type LogUploadResult =
  | { ok: true }
  | { ok: false; error: string };
