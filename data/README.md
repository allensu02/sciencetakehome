# Cleaned Pilot Data

This folder contains anonymized, session-level exports used for the paper table.

- `cleaned_sessions.csv`: every Supabase session row reduced to final metrics.
- `complete_subject_latest_sessions.csv`: latest run per current condition for subjects who completed all 11 current conditions.
- `results_summary.csv`: condition-level summary used for the paper results table.
- `subjects_summary.csv`: anonymized subject-level completion counts.

The export intentionally excludes raw keystroke streams, target sequences,
Supabase row IDs, and original subject names.

Regenerate these files with:

```sh
node analysis/analyze_sessions.mjs
```
