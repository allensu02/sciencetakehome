import type { BitRatePoint, SessionLog, UploadStatus, RuntimeMode } from '../types';

type EndScreenProps = {
  log: SessionLog;
  points: BitRatePoint[];
  mode: RuntimeMode;
  uploadStatus: UploadStatus;
  onDownload: () => void;
  onRetryUpload: () => void;
  onRestart: () => void;
};

export function EndScreen({
  log,
  points,
  mode,
  uploadStatus,
  onDownload,
  onRetryUpload,
  onRestart
}: EndScreenProps): JSX.Element {
  return (
    <main className="panel end">
      <p className="eyebrow">Final report</p>
      <h1>{log.final.bit_rate_bps.toFixed(2)} bps</h1>
      <div className="metrics">
        <Metric label="N" value={log.final.N.toString()} />
        <Metric label="Sc" value={log.final.Sc.toString()} />
        <Metric label="Si" value={log.final.Si.toString()} />
        <Metric label="Condition" value={log.condition_id} />
      </div>

      <BitRateChart points={points} />

      {mode === 'remote' && <UploadMessage status={uploadStatus} onRetryUpload={onRetryUpload} />}

      <div className="actions">
        {(mode === 'local' || (uploadStatus.state === 'failed' && uploadStatus.fallback_available)) && (
          <button className="primary" onClick={onDownload}>Download Log</button>
        )}
        <button className="secondary" onClick={onRestart}>Start New Session</button>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function UploadMessage({ status, onRetryUpload }: { status: UploadStatus; onRetryUpload: () => void }): JSX.Element {
  if (status.state === 'pending') {
    return <div className="banner">Uploading log...</div>;
  }
  if (status.state === 'success') {
    return <div className="banner success">Session log uploaded successfully.</div>;
  }
  if (status.state === 'failed') {
    return (
      <div className="banner warning">
        <p>Upload failed after retries: {status.message}</p>
        <p>The log is saved locally in this browser. You can retry or use the download fallback and contact the study owner.</p>
        <button className="secondary compact" onClick={onRetryUpload}>Retry Upload</button>
      </div>
    );
  }
  return <div className="banner">Preparing upload...</div>;
}

function BitRateChart({ points }: { points: BitRatePoint[] }): JSX.Element {
  const width = 760;
  const height = 240;
  const pad = 36;
  const maxY = Math.max(1, ...points.map((point) => point.bit_rate_bps));
  const series = points.length > 0 ? points : [{ elapsed_s: 0, bit_rate_bps: 0, Sc: 0, Si: 0 }];
  const path = series.map((point, index) => {
    const x = pad + (Math.min(point.elapsed_s, 60) / 60) * (width - pad * 2);
    const y = height - pad - (point.bit_rate_bps / maxY) * (height - pad * 2);
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <section className="chart-card">
      <h2>Bit rate over time</h2>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bit-rate-over-time line chart">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} />
        <path d={path} />
        <text x={pad} y={height - 8}>0s</text>
        <text x={width - pad - 24} y={height - 8}>60s</text>
        <text x={pad + 4} y={pad - 10}>{maxY.toFixed(1)} bps</text>
      </svg>
    </section>
  );
}
