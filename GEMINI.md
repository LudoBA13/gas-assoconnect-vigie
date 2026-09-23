# Project Workflows

- When adding a new alert (e.g., adding a new .toml file in `src/alerts/`), you must regenerate the alerts using `node scripts/generate_alerts.js`, commit the changes, and push via `clasp push`.
- **Non-ASCII in Formulas:** Avoid non-ASCII characters in the `formula` field of `.toml` alert files. If encountered, raise a warning.
