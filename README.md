# BCI Bit-Rate Evaluation Game

Static React + TypeScript implementation of the Science Corporation bit-rate take-home. The shipped app runs entirely in the browser during gameplay. Targets are sampled i.i.d. uniform with replacement from a configured alphabet, and bit rate is computed as:

```text
B = log2(N - 1) * max(Sc - Si, 0) / t
```

## Run Locally

Graders only need Python 3:

```bash
./run.sh
```

`run.sh` serves the committed `dist/` directory on `http://localhost:8000`. Local mode is detected when `window.location.hostname` is `localhost` or `127.0.0.1`; logs are downloaded manually from the end screen.

## Rebuild

Development requires Node/npm:

```bash
npm install
./build.sh
```

`src/` contains the TypeScript source. `dist/` contains the compiled static app and is committed for no-build local grading.

## Conditions

- Single characters: `N=26`, lowercase `a-z`.
- 3-char common words: `N=100`, curated common English words.
- 3-char ergonomic words: `N=100`, common lowercase words selected for low QWERTY typing effort.
- 3-char ergonomic nonwords: `N=1000`, lowercase nonwords selected for low QWERTY typing effort.
- 3-char pronounceable nonwords: `N=500`, generated CVC strings.
- 5-char common words: `N=1000`, frequency-ordered from `first20hours/google-10000-english`, filtered to lowercase 5-letter entries.
- 5-char ergonomic words: `N=1000`, selected from the 5-letter `first20hours/google-10000-english` pool by a QWERTY effort model.
- 5-char ergonomic nonwords: `N=1000`, generated CVCVC-style strings selected for low QWERTY typing effort after dictionary and frequency-list exclusion.

The homework says "no word-level targets." This implementation treats fixed-length strings drawn i.i.d. uniform from a fixed alphabet, scored only by whole-string exact match, as compliant because the selection sequence has no language-model statistics and no predictive/partial-word credit.

The ergonomic lists are still fixed alphabets sampled uniformly with replacement. They are ranked by a deterministic QWERTY model that rewards home-row use, hand alternation, and inward rolls while penalizing weak fingers, same-finger transitions, and row jumps.

## Architecture

- `src/core/session.ts`: pure session state machine, scoring, timing, bit-rate math.
- `src/core/rng.ts`: `crypto.getRandomValues` uniform draws with replacement.
- `src/input/`: keyboard handler plus voice/head-tracking stubs.
- `src/configs/`: four typed condition configs and static alphabets.
- `src/logging/SessionLogger.ts`: typed session log assembly.
- `src/logging/LogUploader.ts`: Supabase upload, pending-log localStorage fallback, retry.
- `src/audit/audit.ts`: 100k-draw chi-squared and lag-1 serial-correlation audit.
- `src/components/`: consent, start, gameplay, and end-report screens.

## Remote Deployment

Remote mode is active for any hostname other than `localhost` or `127.0.0.1`.

1. Create a Supabase project.
2. Run the SQL below in the Supabase SQL editor.
3. Copy `.env.example` to `.env` locally, or set these env vars in Vercel/Netlify:

```text
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

4. Build with `./build.sh`.
5. Deploy the static `dist/` directory to Vercel or Netlify.

Recommended Vercel settings:

```text
Build command: npm install && ./build.sh
Output directory: dist
Environment variables: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
```

Recommended Netlify settings:

```text
Build command: npm install && ./build.sh
Publish directory: dist
Environment variables: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
```

## Supabase SQL

```sql
create extension if not exists pgcrypto;

create table public.session_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  log jsonb not null
);

alter table public.session_logs enable row level security;

create policy "Anyone can insert session logs"
on public.session_logs
for insert
to anon
with check (true);
```

Do not add an anon `SELECT` policy.

## Admin Dashboard

The deployed app includes an admin dashboard at:

```text
https://your-deployment.vercel.app/admin
```

The dashboard uses Supabase Auth and RLS. Public users can insert logs, but only your authenticated admin email can read them.

Add this policy in Supabase SQL Editor, replacing the email:

```sql
create policy "Only admin can read session logs"
on public.session_logs
for select
to authenticated
using (
  auth.jwt() ->> 'email' = 'YOUR_EMAIL@example.com'
);
```

Supabase Auth setup:

1. Go to Authentication -> Providers and make sure Email is enabled.
2. Go to Authentication -> URL Configuration.
3. Set Site URL to your deployed app URL.
4. Add this Redirect URL:

```text
https://your-deployment.vercel.app/admin
```

Then open `/admin`, enter the admin email, and use the magic link. The dashboard groups sessions by trimmed `subject_id`, lists readable Pacific-time session dates, and shows the same bit-rate-over-time chart style used on the participant result screen.

## Remote Logging Behavior

No network calls happen during scored gameplay. At the end of a scored remote session:

1. The completed log is written to `localStorage` as `pending_log_<session_id>`.
2. The app attempts to insert `{ log }` into `public.session_logs`.
3. It silently retries twice.
4. On success, the pending local copy is removed and a confirmation is shown.
5. On failure, the pending local copy remains, a retry state is shown, and a download fallback appears.

On page load in remote mode, pending logs are retried quietly. If any retry fails, the start screen shows a small banner.

## Privacy Notes

The app payload contains only the session log: subject ID, condition/config, target presentations, task keystrokes, task timestamps, and final metrics. It does not add IP address, user agent, browser fingerprint, audio, video, or any text outside the subject ID.

Hosting providers and Supabase may keep platform-level request logs such as IP addresses or user agents by default, outside this app's JSON payload. Review Vercel/Netlify/Supabase retention settings if that matters for the study.
