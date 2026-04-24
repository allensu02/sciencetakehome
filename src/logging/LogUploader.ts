import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { LogUploadResult, SessionLog } from '../types';

declare const PUBLIC_SUPABASE_URL: string;
declare const PUBLIC_SUPABASE_ANON_KEY: string;

const PENDING_PREFIX = 'pending_log_';

let client: SupabaseClient | null = null;

export function isLocalMode(hostname = window.location.hostname): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function pendingKey(sessionId: string): string {
  return `${PENDING_PREFIX}${sessionId}`;
}

export function savePendingLog(log: SessionLog): void {
  localStorage.setItem(pendingKey(log.session_id), JSON.stringify(log));
}

export function removePendingLog(sessionId: string): void {
  localStorage.removeItem(pendingKey(sessionId));
}

export function getPendingLogs(): SessionLog[] {
  const logs: SessionLog[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(PENDING_PREFIX)) {
      continue;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }
    try {
      logs.push(JSON.parse(raw) as SessionLog);
    } catch {
      localStorage.removeItem(key);
    }
  }
  return logs;
}

export async function completeUpload(log: SessionLog): Promise<LogUploadResult> {
  savePendingLog(log);
  const result = await uploadWithRetries(log, 2);
  if (result.ok) {
    removePendingLog(log.session_id);
  }
  return result;
}

export async function retryPendingLogs(): Promise<{ attempted: number; failed: number }> {
  const logs = getPendingLogs();
  let failed = 0;
  for (const log of logs) {
    const result = await uploadLog(log);
    if (result.ok) {
      removePendingLog(log.session_id);
    } else {
      failed += 1;
    }
  }
  return { attempted: logs.length, failed };
}

async function uploadWithRetries(log: SessionLog, silentRetries: number): Promise<LogUploadResult> {
  let lastError = 'Upload failed';
  for (let attempt = 0; attempt <= silentRetries; attempt += 1) {
    const result = await uploadLog(log);
    if (result.ok) {
      return result;
    }
    lastError = result.error;
  }
  return { ok: false, error: lastError };
}

async function uploadLog(log: SessionLog): Promise<LogUploadResult> {
  const supabase = getClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY before deploying.' };
  }

  const { error } = await supabase.from('session_logs').insert({ log });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function getClient(): SupabaseClient | null {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  if (client === null) {
    client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
  return client;
}
