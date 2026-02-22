# ZKTeco import

How to import user and attendance data from ZKTeco devices via `.dat` files.

## Overview

1. Export **user.dat** and/or **att.dat** from the device.
2. Go to **Import** (manager only) in the app.
3. Upload **user.dat** first so `profiles.bio_id` exists; then upload **att.dat** to create `attendance_logs` (one row per employee per day: first punch = `time_in`, last punch = `time_out`).

## File format (reference)

- **user.dat** — One user per line: `{bio_id}\t{name}\t{privilege}\t{password}\t{card_number}`.
- **att.dat** — One punch per line: `{bio_id}\t{YYYY-MM-DD HH:mm:ss}\t{status_code}\t0`. Status: 0 = check-in, 1 = check-out, 4 = overtime in, 5 = overtime out.

## Detailed flow

For the full step-by-step import flow (upload → parse → preview → upsert), see **`IMPORT_FLOW.md`** in the project root.
