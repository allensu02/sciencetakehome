# Pilot Data Analysis

`analyze_sessions.mjs` pulls session logs from Supabase and writes anonymized,
session-level CSVs under `data/`.

The exported files intentionally omit raw keystroke streams, target sequences,
Supabase row IDs, and original subject IDs. Subject identifiers are replaced with
stable codes (`S01`, `S02`, ...), and sessions are replaced with row-order codes
(`R0001`, `R0002`, ...).

Run from the repository root:

```sh
node analysis/analyze_sessions.mjs
```

Required local environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These are read from `.env`, which is ignored by git.
