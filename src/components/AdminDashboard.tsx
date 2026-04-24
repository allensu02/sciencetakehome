import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getAdminClient } from '../logging/LogUploader';
import type { BitRatePoint, SessionLog } from '../types';
import { BitRateChart } from './EndScreen';

type SessionLogRow = {
  id: string;
  created_at: string;
  log: SessionLog;
};

type SubjectGroup = {
  subjectId: string;
  sessions: SessionLogRow[];
};

export function AdminDashboard(): JSX.Element {
  const supabase = getAdminClient();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [rows, setRows] = useState<SessionLogRow[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      return;
    }
    setLoading(true);
    void supabase
      .from('session_logs')
      .select('id, created_at, log')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          setMessage(error.message);
          return;
        }
        const nextRows = (data ?? []) as SessionLogRow[];
        setRows(nextRows);
        const firstSubject = groupRows(nextRows)[0]?.subjectId ?? null;
        setSelectedSubjectId((current) => current ?? firstSubject);
      });
  }, [session, supabase]);

  const groups = useMemo(() => groupRows(rows), [rows]);
  const selectedGroup = groups.find((group) => group.subjectId === selectedSubjectId) ?? groups[0] ?? null;
  const selectedSession = selectedGroup?.sessions.find((row) => row.id === selectedSessionId)
    ?? selectedGroup?.sessions[0]
    ?? null;
  const chartPoints = useMemo(
    () => selectedSession ? reconstructBitRatePoints(selectedSession.log) : [],
    [selectedSession]
  );

  if (!supabase) {
    return (
      <main className="panel admin">
        <h1>Admin</h1>
        <div className="banner warning">Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY, then redeploy.</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="panel admin">
        <p className="eyebrow">Admin</p>
        <h1>Session dashboard</h1>
        <p className="lead">Sign in with the admin email allowed by the Supabase RLS read policy.</p>
        <form
          className="admin-login"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            void supabase.auth.signInWithOtp({
              email: email.trim(),
              options: {
                emailRedirectTo: `${window.location.origin}/admin`
              }
            }).then(({ error }) => {
              setMessage(error ? error.message : 'Check your email for the login link.');
            });
          }}
        >
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <button className="primary">Send magic link</button>
        </form>
        {message && <div className="banner">{message}</div>}
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Session dashboard</h1>
        </div>
        <button className="secondary" onClick={() => void supabase.auth.signOut()}>Sign out</button>
      </header>

      {message && <div className="banner warning">{message}</div>}
      {loading && <div className="banner">Loading session logs...</div>}

      <section className="admin-grid">
        <aside className="admin-card">
          <h2>Subjects</h2>
          {groups.map((group) => (
            <button
              className={`admin-list-item ${group.subjectId === selectedGroup?.subjectId ? 'selected' : ''}`}
              key={group.subjectId}
              onClick={() => {
                setSelectedSubjectId(group.subjectId);
                setSelectedSessionId(null);
              }}
            >
              <strong>{group.subjectId}</strong>
              <span>{group.sessions.length} session{group.sessions.length === 1 ? '' : 's'}</span>
            </button>
          ))}
        </aside>

        <aside className="admin-card">
          <h2>Sessions</h2>
          {selectedGroup?.sessions.map((row) => (
            <button
              className={`admin-list-item ${row.id === selectedSession?.id ? 'selected' : ''}`}
              key={row.id}
              onClick={() => setSelectedSessionId(row.id)}
            >
              <strong>{formatPacificDate(row.created_at)}</strong>
              <span>{row.log.condition_id}</span>
              <span>{row.log.final.bit_rate_bps.toFixed(2)} bps | Sc {row.log.final.Sc} | Si {row.log.final.Si}</span>
            </button>
          ))}
        </aside>

        <section className="admin-card admin-detail">
          {selectedSession ? (
            <>
              <h2>{selectedSession.log.subject_id}</h2>
              <div className="metrics">
                <Metric label="Created" value={formatPacificDate(selectedSession.created_at)} />
                <Metric label="Condition" value={selectedSession.log.condition_id} />
                <Metric label="Final B" value={`${selectedSession.log.final.bit_rate_bps.toFixed(2)} bps`} />
                <Metric label="Sc / Si" value={`${selectedSession.log.final.Sc} / ${selectedSession.log.final.Si}`} />
              </div>
              <BitRateChart points={chartPoints} />
            </>
          ) : (
            <p className="muted">No sessions found.</p>
          )}
        </section>
      </section>
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

function groupRows(rows: SessionLogRow[]): SubjectGroup[] {
  const groups = new Map<string, SessionLogRow[]>();
  for (const row of rows) {
    const subjectId = row.log.subject_id.trim() || 'anon';
    groups.set(subjectId, [...(groups.get(subjectId) ?? []), row]);
  }
  return [...groups.entries()]
    .map(([subjectId, sessions]) => ({ subjectId, sessions }))
    .sort((a, b) => a.subjectId.localeCompare(b.subjectId));
}

function reconstructBitRatePoints(log: SessionLog): BitRatePoint[] {
  const firstInput = log.inputs[0];
  const duration = log.duration_s || 60;
  if (!firstInput) {
    return [{ elapsed_s: 0, bit_rate_bps: 0, Sc: 0, Si: 0 }];
  }

  const startMs = firstInput.timestamp_ms;
  const completedInputs = log.inputs
    .filter((input) => input.selection_complete)
    .map((input) => ({
      elapsed_s: Math.max((input.timestamp_ms - startMs) / 1000, 0),
      selection_correct: input.selection_correct === true
    }))
    .sort((a, b) => a.elapsed_s - b.elapsed_s);

  const points: BitRatePoint[] = [];
  let completedIndex = 0;
  let Sc = 0;
  let Si = 0;

  for (let elapsed = 0; elapsed <= duration; elapsed += 0.25) {
    while (completedIndex < completedInputs.length && completedInputs[completedIndex].elapsed_s <= elapsed) {
      if (completedInputs[completedIndex].selection_correct) {
        Sc += 1;
      } else {
        Si += 1;
      }
      completedIndex += 1;
    }
    const bitRate = elapsed <= 0
      ? 0
      : Math.log2(log.final.N - 1) * Math.max(Sc - Si, 0) / elapsed;
    points.push({
      elapsed_s: elapsed,
      bit_rate_bps: bitRate,
      Sc,
      Si
    });
  }

  return points;
}

function formatPacificDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(iso));
}
