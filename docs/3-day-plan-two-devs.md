# Klinth — 3-Day Plan: Two Developers + Paper Rectification

**Purpose:** Coordinate lead dev and student assistant to deliver rectification flow and paper-log recovery support without micromanagement. Includes handling bio device data loss (weeks of paper logs).

---

## 1. Codebase analysis summary

| Area | Current state |
|------|----------------|
| **Attendance** | Created only via ZKTeco .dat import → `attendance_logs` (staff_id, date, time_in, time_out, source: `biometric`). No manual/paper entry UI. |
| **Rectification** | DB table `rectification_requests` exists (user_id, attendance_id, date, reason, requested_in/out, status). **No store, no API calls, placeholder views only** (RectifyView.vue, RectificationsView.vue). |
| **Paper / manual** | Not implemented. AttendanceView subtitle mentions "manual entry" but there is no form or store action. |
| **Gap** | Paper weeks never become rows → no `attendance_id` to attach rectifications to. Rectification submit/approve flow is unwired. |

**Conclusion:** Implement (1) rectification backend + employee submit + manager review, and (2) a way to create attendance from paper (manual entry or bulk “paper import”) so those weeks can be rectified.

---

## 2. System phases (technical)

| Phase | Goal | Deliverables |
|-------|------|--------------|
| **Phase A — Rectification core** | Employees can submit requests; managers can list and approve/reject. | Rectification Pinia store, Supabase reads/writes, RectifyView form, RectificationsView list + actions. Optional: link from MyAttendanceView “Request rectification” to prefill date. |
| **Phase B — Paper / manual attendance** | Support weeks with no biometric data. | Manual entry UI (e.g. in AttendanceView or dedicated “Add entry”): pick staff + date, set time_in/time_out, source: `manual`. RLS already allows managers to insert/update. |
| **Phase C — Paper rectification** | Rectification works for paper-backed days. | Allow rectification when `attendance_id` is null (e.g. “Add missing day”): request creates or updates an `attendance_logs` row on approval. Optional: bulk “paper log import” (e.g. CSV by date range + staff) for faster backfill. |
| **Phase D — Polish** | Reliable and clear for users. | Validation, error messages, success toasts, and a short internal doc for “how to handle paper weeks” (who enters data, who approves rectifications). |

---

## 3. Bio device data loss — paper rectification in the plan

**Context:** The bio device had data loss; for some weeks, the only record is paper. Users need to rectify those weeks (correct times or add missing days).

**In the plan:**

- **Phase B** gives managers a way to create attendance rows from paper (manual entry by staff + date + times). Those rows get `source: 'manual'` and can later be linked to rectification requests.
- **Phase C** ensures rectification supports “missing day” cases: employee requests a date with no row; on approval, the system creates (or updates) the `attendance_logs` row so the week is complete.
- **Process for “weeks on paper”:**
  1. **Option A (recommended):** Manager (or delegated person) enters paper-log data via manual entry (Phase B) for the affected date range and staff. Then employees use Rectify to fix any wrong times (Phase A/C).
  2. **Option B:** Employees submit rectification requests for missing days; manager approves and the system creates the attendance row (Phase C). Use when paper is sparse and you prefer request-driven backfill.

Document the chosen option (A vs B or hybrid) in `docs/usage.md` or a short “Paper log recovery” section so both devs and office staff know the workflow.

---

## 4. 3-day plan for 2 developers

**Roles:** Lead dev (you), Student assistant (SA).  
**Style:** Outcome-based. Lead sets goals and acceptance criteria; SA owns specific tasks and reports blockers. No micromanagement: daily sync, not constant check-ins.

---

### Day 1 — Foundation and rectification backend

**Lead**

- **Own:** Rectification data layer and manager review.
  - Add `useRectificationStore.js`: fetch list (filter by status optional), submit (employee), approve/reject (manager). Map to `rectification_requests` and `attendance_logs` where needed.
  - Wire **RectificationsView.vue**: load requests, show table (date, staff/name, reason, requested in/out, status), actions Approve / Reject. On approve: update request status and optionally create/update `attendance_logs` if applicable.
- **Define for SA:** “By EOD, employee can open Rectify, submit one request (date, reason, requested_in/out), and it appears in DB and in manager Rectifications list.”
- **Sync:** 15-min standup (start of day): today’s outcomes. 15-min EOD: demo employee submit + manager list; note blockers for Day 2.

**Student assistant**

- **Own:** Employee rectification form.
  - **RectifyView.vue:** Form fields: date, reason (textarea), requested time in, requested time out. Submit calls rectification store. Show validation and success/error message.
  - Optional: from MyAttendanceView, “Request rectification” link that navigates to Rectify with date prefilled (query param or store).
- **Acceptance criteria (set by lead):** One successful submit creates a row in `rectification_requests` and it appears in RectificationsView.
- **Report:** At EOD sync: “Done / not done” and one sentence on any blocker.

---

### Day 2 — Manual entry (paper support) and rectification approval

**Lead**

- **Own:** Manual attendance entry (paper support).
  - In **AttendanceView** (or a small “Add entry” modal/section): form — staff dropdown, date, time in, time out; source `manual`. Insert/upsert to `attendance_logs` via existing RLS. List view already shows all logs; optional: show `source` column so manual vs biometric is clear.
- **Define for SA:** “By EOD, manager can approve a rectification request and the corresponding attendance row is created or updated (time_in/time_out) when applicable.”
- **Sync:** Same standup + EOD. Confirm: manual entry works; approval updates or creates attendance.

**Student assistant**

- **Own:** Approve/reject flow and attendance update.
  - In **RectificationsView.vue:** Approve/Reject buttons call store. On approve: if `attendance_id` exists, update that row’s time_in/time_out; if no `attendance_id` (missing day), create new `attendance_logs` row (staff resolved from request’s user → profile → bio_id → staff_id, or pass staff_id in request if you extend schema). Set status to approved and reviewed_by/reviewed_at.
  - **Acceptance criteria:** Approving a request reflects correct times (or new row) in Attendance view.
  - **Report:** EOD: “Done / not done,” any edge cases (e.g. no staff_id for user).

---

### Day 3 — Paper rectification flow and coordination

**Lead**

- **Own:** “Missing day” path and docs.
  - Ensure rectification request can carry enough info to create an attendance row when `attendance_id` is null (e.g. date + requested_in/out + user → staff). If schema needs a nullable link or extra field, add minimal migration or document workaround.
  - Short section in `docs/usage.md`: “Paper log recovery (bio data loss)” — who enters manual data, who approves rectifications, Option A vs B.
- **Define for SA:** “By EOD, an employee can request rectification for a date with no attendance row; manager approves and the day appears in attendance (manual source).”
- **Sync:** Full walkthrough: manual entry for a week, one rectification for a missing day, one for correcting time. Sign-off and list any follow-up bugs/tasks.

**Student assistant**

- **Own:** End-to-end testing and small UX improvements.
  - Test: (1) Submit request for a date that has no attendance → approve → row created. (2) Submit for existing row → approve → times updated. (3) Reject flow.
  - Optional: success toasts, clearer error messages, or “Request rectification” from MyAttendanceView with date prefilled.
- **Acceptance criteria:** Both “missing day” and “correct time” flows work; no regressions on existing import/attendance list.
  - **Report:** EOD: test results and list of minor issues (if any) for backlog.

---

## 5. Lead coordination — avoiding micromanagement

- **Outcomes over tasks:** Each day you define *what* must be true by EOD (e.g. “employee can submit, manager sees list”) and let SA choose *how* within the stack (Vue, Pinia, Supabase, Tailwind).
- **Single daily sync:** One short standup at day start (outcomes for the day), one EOD sync (demo + blockers). No requirement for constant Slack/check-ins.
- **Clear boundaries:** Lead owns store design and manager-side flows; SA owns employee form and approval wiring. Overlap is only at the interface (store methods and props).
- **Blockers:** SA reports blockers at EOD (or async in one channel). Lead unblocks next morning or delegates one clear next step.
- **Docs:** Lead adds the “Paper log recovery” process so both devs and office staff have one place to read the intended workflow after the bio device data loss.

---

## 6. Checklist for handoff

- [ ] `useRectificationStore.js` with list, submit, approve, reject.
- [ ] RectifyView: form wired; optional MyAttendanceView link with date.
- [ ] RectificationsView: table + Approve/Reject; approval creates/updates attendance when applicable.
- [ ] Manual entry in AttendanceView (staff, date, time in/out, source manual).
- [ ] “Missing day” rectification: approve creates `attendance_logs` row.
- [ ] `docs/usage.md` (or separate doc): “Paper log recovery” for weeks with paper only.
- [ ] EOD Day 3: one full demo and backlog of small follow-ups (if any).

---

*Last updated: 2025-02-23*
