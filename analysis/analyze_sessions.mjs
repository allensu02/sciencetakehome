import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

const CURRENT_CONDITIONS = [
  'single_char_random_letters',
  'three_char_common_words_n100',
  'three_char_all_words_n1567',
  'three_char_ergonomic_nonwords_n100',
  'three_char_ergonomic_nonwords_n1000',
  'three_char_ergonomic_nonwords_n16009',
  'five_char_common_words_n1000',
  'five_char_all_words_n10365',
  'five_char_ergonomic_nonwords_n1000',
  'five_char_ergonomic_nonwords_n100000',
  'five_char_ergonomic_nonwords_n11871011'
];

const CONDITION_LABELS = {
  single_char_random_letters: 'Single characters',
  three_char_common_words_n100: '3-char common words',
  three_char_all_words_n1567: '3-char all words',
  three_char_ergonomic_nonwords_n100: '3-char nonwords',
  three_char_ergonomic_nonwords_n1000: '3-char nonwords',
  three_char_ergonomic_nonwords_n16009: '3-char nonwords',
  five_char_common_words_n1000: '5-char common words',
  five_char_all_words_n10365: '5-char all words',
  five_char_ergonomic_nonwords_n1000: '5-char nonwords',
  five_char_ergonomic_nonwords_n100000: '5-char nonwords',
  five_char_ergonomic_nonwords_n11871011: '5-char nonwords'
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const env = readEnv(path.join(ROOT, '.env'));
  const url = env.SUPABASE_URL ?? env.PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY ?? env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const rows = await fetchRows(supabase);
  const sessions = rows
    .map((row, index) => normalizeSession(row, index))
    .filter((session) => Number.isFinite(session.bit_rate_bps));

  const subjectCodes = makeSubjectCodes(sessions);
  for (const session of sessions) {
    session.subject_code = subjectCodes.get(session.subject_raw) ?? 'S00';
    delete session.subject_raw;
  }

  const latestSessionCodes = latestSubjectConditionSessionCodes(sessions);
  const completedSubjects = completedCurrentSubjects(sessions);
  for (const session of sessions) {
    session.is_current_condition = CURRENT_CONDITIONS.includes(session.condition_id);
    session.is_latest_for_subject_condition = latestSessionCodes.has(session.session_code);
    session.completed_all_11 = completedSubjects.has(session.subject_code);
  }

  const completeLatest = sessions.filter(
    (session) => session.completed_all_11
      && session.is_current_condition
      && session.is_latest_for_subject_condition
  );
  const summary = summarizeByCondition(completeLatest);
  const subjectSummary = summarizeSubjects(sessions);

  fs.mkdirSync(DATA_DIR, { recursive: true });
  writeCsv(path.join(DATA_DIR, 'cleaned_sessions.csv'), sessions, [
    'session_code',
    'subject_code',
    'created_at',
    'started_at',
    'condition_id',
    'condition_label',
    'N',
    'Sc',
    'Si',
    'bit_rate_bps',
    'accuracy',
    'duration_s',
    'is_current_condition',
    'is_latest_for_subject_condition',
    'completed_all_11'
  ]);
  writeCsv(path.join(DATA_DIR, 'complete_subject_latest_sessions.csv'), completeLatest, [
    'session_code',
    'subject_code',
    'created_at',
    'condition_id',
    'condition_label',
    'N',
    'Sc',
    'Si',
    'bit_rate_bps',
    'accuracy'
  ]);
  writeCsv(path.join(DATA_DIR, 'results_summary.csv'), summary, [
    'condition_id',
    'condition_label',
    'N',
    'subjects',
    'mean_bps',
    'median_bps',
    'sd_bps',
    'mean_Sc',
    'mean_Si',
    'mean_accuracy'
  ]);
  writeCsv(path.join(DATA_DIR, 'subjects_summary.csv'), subjectSummary, [
    'subject_code',
    'sessions',
    'current_conditions_seen',
    'completed_all_11',
    'first_created_at',
    'last_created_at'
  ]);

  console.log(`Fetched ${rows.length} Supabase rows.`);
  console.log(`Wrote ${sessions.length} anonymized session rows to data/cleaned_sessions.csv.`);
  console.log(`Complete current-condition subjects: ${completedSubjects.size}.`);
  console.log('Wrote data/results_summary.csv from latest runs for complete subjects.');
}

async function fetchRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('session_logs')
      .select('id, created_at, log')
      .order('created_at', { ascending: true })
      .range(from, from + 999);
    if (error) {
      throw error;
    }
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) {
      break;
    }
  }
  return rows;
}

function normalizeSession(row, index) {
  const log = row.log ?? {};
  const final = log.final ?? {};
  const Sc = Number(final.Sc);
  const Si = Number(final.Si);
  const N = Number(final.N ?? log.config?.alphabet?.length ?? log.config?.generated_alphabet?.size);
  const bitRate = Number(final.bit_rate_bps);
  return {
    session_code: `R${String(index + 1).padStart(4, '0')}`,
    subject_raw: String(log.subject_id ?? '').trim() || 'anon',
    created_at: row.created_at,
    started_at: log.started_at ?? '',
    condition_id: String(log.condition_id ?? ''),
    condition_label: CONDITION_LABELS[String(log.condition_id ?? '')] ?? String(log.condition_id ?? ''),
    N,
    Sc,
    Si,
    bit_rate_bps: bitRate,
    accuracy: Sc + Si > 0 ? Sc / (Sc + Si) : '',
    duration_s: Number(log.duration_s ?? log.config?.duration_seconds ?? 60)
  };
}

function makeSubjectCodes(sessions) {
  const firstSeen = new Map();
  for (const session of sessions) {
    const current = firstSeen.get(session.subject_raw);
    if (!current || session.created_at < current) {
      firstSeen.set(session.subject_raw, session.created_at);
    }
  }

  return new Map(
    [...firstSeen.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]))
      .map(([subject], index) => [subject, `S${String(index + 1).padStart(2, '0')}`])
  );
}

function latestSubjectConditionSessionCodes(sessions) {
  const latest = new Map();
  for (const session of sessions) {
    const key = subjectConditionKey(session);
    const current = latest.get(key);
    if (!current || session.created_at > current.created_at) {
      latest.set(key, session);
    }
  }
  return new Set([...latest.values()].map((session) => session.session_code));
}

function completedCurrentSubjects(sessions) {
  const bySubject = new Map();
  for (const session of sessions) {
    if (!CURRENT_CONDITIONS.includes(session.condition_id)) {
      continue;
    }
    const conditions = bySubject.get(session.subject_code) ?? new Set();
    conditions.add(session.condition_id);
    bySubject.set(session.subject_code, conditions);
  }
  return new Set(
    [...bySubject.entries()]
      .filter(([, conditions]) => CURRENT_CONDITIONS.every((condition) => conditions.has(condition)))
      .map(([subject]) => subject)
  );
}

function summarizeByCondition(sessions) {
  return CURRENT_CONDITIONS.map((conditionId) => {
    const group = sessions.filter((session) => session.condition_id === conditionId);
    return {
      condition_id: conditionId,
      condition_label: CONDITION_LABELS[conditionId],
      N: group[0]?.N ?? '',
      subjects: new Set(group.map((session) => session.subject_code)).size,
      mean_bps: mean(group.map((session) => session.bit_rate_bps)),
      median_bps: median(group.map((session) => session.bit_rate_bps)),
      sd_bps: standardDeviation(group.map((session) => session.bit_rate_bps)),
      mean_Sc: mean(group.map((session) => session.Sc)),
      mean_Si: mean(group.map((session) => session.Si)),
      mean_accuracy: mean(group.map((session) => session.accuracy))
    };
  });
}

function summarizeSubjects(sessions) {
  const bySubject = new Map();
  for (const session of sessions) {
    const current = bySubject.get(session.subject_code) ?? [];
    current.push(session);
    bySubject.set(session.subject_code, current);
  }
  return [...bySubject.entries()].map(([subject, subjectSessions]) => {
    const currentConditions = new Set(
      subjectSessions
        .map((session) => session.condition_id)
        .filter((condition) => CURRENT_CONDITIONS.includes(condition))
    );
    const created = subjectSessions.map((session) => session.created_at).sort();
    return {
      subject_code: subject,
      sessions: subjectSessions.length,
      current_conditions_seen: currentConditions.size,
      completed_all_11: CURRENT_CONDITIONS.every((condition) => currentConditions.has(condition)),
      first_created_at: created[0],
      last_created_at: created.at(-1)
    };
  });
}

function subjectConditionKey(session) {
  return `${session.subject_code ?? session.subject_raw}\t${session.condition_id}`;
}

function mean(values) {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) {
    return '';
  }
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function median(values) {
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (finite.length === 0) {
    return '';
  }
  const middle = Math.floor(finite.length / 2);
  return finite.length % 2 === 1 ? finite[middle] : (finite[middle - 1] + finite[middle]) / 2;
}

function standardDeviation(values) {
  const finite = values.filter(Number.isFinite);
  if (finite.length < 2) {
    return '';
  }
  const avg = mean(finite);
  const variance = finite.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (finite.length - 1);
  return Math.sqrt(variance);
}

function writeCsv(filePath, rows, columns) {
  const csv = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))
  ].join('\n') + '\n';
  fs.writeFileSync(filePath, csv);
}

function csvCell(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(6);
  }
  const stringValue = String(value);
  if (/["\n,]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function readEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const equals = trimmed.indexOf('=');
    if (equals === -1) {
      continue;
    }
    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}
