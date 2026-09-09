# TeamPulse - Weekly Report Generator & Team Dashboard

**TeamPulse** is a robust MERN application with two roles (`member`, `manager`), a shared login/register screen, private drafts, immutable submission content, manager review, team analytics and nine connected views built for the Technical SE Assignment.

## Install and run

Use Node.js 18+ and npm. Run `npm run install:all` in the repository root.

Copy `server/.env.example` to `server/.env` if it does not exist. Generate a unique JWT secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste that value into `JWT_SECRET`. Known example secrets and missing/short secrets are rejected. The local secret is ignored by Git. Changing it signs out existing sessions.

Database choices:

- Local development: leave `MONGODB_URI` empty. A local MongoDB process uses **persistent WiredTiger storage in `.data/mongodb`**. The first run downloads the official MongoDB binary. Stop the backend before running a standalone seed against this same directory. Do not run two local database instances against it.
- Existing MongoDB or Atlas: set `MONGODB_URI` to your connection URI, including a database name. A failed connection is reported; it never silently switches to a blank database.
- Production requires `MONGODB_URI`, a unique JWT secret, and a specific `CLIENT_URL`.
- Tests always use a separate disposable database and never clear the configured application database.

For a fresh demo, run `npm run seed`, then `npm run dev`. **The seed command replaces data in the selected development database.** It is disabled in production. Do not run it on data you need to retain. Alternatively, set `AUTO_SEED=true` to populate only an empty development database on startup.

Run independently with `npm run dev:server` and `npm run dev:client`. Frontend: http://localhost:5173; API: http://localhost:5000/api; health: `/api/health`.

Build: `npm run build --prefix client`. Tests: `npm test`.

## Demo accounts

All demo passwords are `Password123!` and intended only for the local assignment demo.

| Account                  | Role            |
| ------------------------ | --------------- |
| alex.manager@company.com | Manager / Admin |
| sarah@company.com        | Member          |
| david@company.com        | Member          |
| elena@company.com        | Member          |
| marcus@company.com       | Member          |

The seed creates four members, a manager, projects and three reporting weeks relative to the seed date. It includes Submitted, Needs Correction, Draft, Approved and Not Started examples, plus complete version snapshots. Existing historic snapshots in a pre-fix database cannot be reconstructed reliably; the seed improvements apply to a newly seeded demo. New application submissions contain full snapshots.

## Pages and permissions

1. Shared login/register (`/login`, `/register`). Registration always creates a Member.
2. Personal report editor (`/reports/new`, `/reports/:id/edit`).
3. Personal history (`/reports`), with status filter and pagination.
4. Read-only report detail (`/reports/:id`).
5. Manager review (`/review/:id`).
6. Manager dashboard (`/dashboard`).
7. Project/category management (`/projects`).
8. Member profile (`/team/:userId`).
9. User management (`/users`), including account creation/invitation, role changes and deactivation.

Managers cannot rewrite another member's content. Draft content is private; dashboard draft rows contain metadata only. User removal is deactivation to preserve references. Referenced projects are archived rather than deleted. Invitations currently create accounts with temporary credentials for manual delivery; automatic email delivery is not implemented.

## Review and versioning

Draft → Submitted → Approved, or Submitted → Needs Correction → Submitted. Changes requested require a comment. Members edit only Draft or Needs Correction. Each submission creates a complete snapshot; reviews attach to that exact version. The version viewer displays dates, project, all task fields, plans, blockers, achievements, hours, notes, links and review information. Working correction edits do not replace submitted content in manager detail, profile or team analytics.

## Analytics rules

- Reporting uses ISO weeks, Monday through Sunday, in UTC. The deadline is the following Monday at 00:00 UTC.
- Date ranges select overlapping report periods; ranges are limited to one year. Report week/year are derived from the start date.
- On-time compliance counts **member/weeks**, not report documents. Multiple reports by one member never inflate it beyond 100%. A Needs Correction report still counts as submitted.
- For each expected member/week: submitted = first submission on time; late = first submission after deadline; pending = no submission before the deadline; overdue = no submission after the deadline. Resubmissions do not reset the first submission time.
- The expected population is currently active Members whose creation date precedes the week deadline. Historical role/deactivation history is not modeled; historical analytics use the current active roster.
- Member/project/date filters apply to report metrics, charts, comparison and activity. A project filter asks whether each selected member reported on that project; it is not a project-assignment compliance calculation.
- Status filters narrow report results and report metrics. Compliance retains the full selected member/week population so a status filter does not change its denominator.
- Total Submitted is the number of reports submitted at least once in the selected reporting period; the compliance breakdown uses member/weeks. These are intentionally different units.
- Open blockers are nonempty, unresolved blocker entries in latest submitted snapshots. Repeated entries in separate reports count separately. Mark Resolved in an editable report and submit to update manager analytics.
- Optional hours are summed when provided; zero totals do not establish that no work occurred.
- Select a multiweek date range to inspect a trend over time. Current week is derived at runtime, including ISO week 53/year boundaries.

## Backend and data design

Routes/controllers implement authentication, reports, reviews, projects, users and dashboard endpoints. `server/services/reportAnalytics.js` centralizes reporting periods, submitted-content selection and member/week compliance calculations. Mongoose models represent users, projects and reports with embedded versions/review metadata. See [ER diagram](docs/er-diagram.svg).

JWT Bearer tokens are held in browser local storage and expire according to `JWT_EXPIRES_IN`; logout removes the local token. Server-side token revocation and HTTP-only cookie migration are not implemented. Do not deploy the demonstration with public demo credentials. The JWT secret is mandatory and has no known fallback.

## AI Intelligence & Reporting Assistant

TeamPulse includes an integrated AI Reporting Assistant drawer powered by a **dual-engine architecture**:

- **Live Generative LLM Engine**: Seamlessly integrates with Google Gemini (`gemini-1.5-flash`) or OpenAI (`gpt-4o-mini`) via API keys configured in `server/.env` (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
- **Autonomous Smart Heuristic Engine**: Automatically engages if no third-party API key is provided, providing instant cross-team analytics, blocker diagnostics, and workload breakdowns locally without external network dependencies.
- **Strict Privacy Isolation**: In compliance with enterprise confidentiality rules, draft reports are permanently excluded from LLM context prompts; only authorized, formally submitted reports are ingested.

## Security Architecture & OWASP Hardening

The application is hardened against common web and API vulnerabilities:

- **HTTP Security Headers**: Powered by `helmet` to mitigate MIME-sniffing, clickjacking, and XSS attacks.
- **Fingerprint Masking**: `x-powered-by` header disabled to prevent runtime exposure.
- **DoS Mitigation**: JSON and URL-encoded payloads capped at 2MB; rate limiters protect authentication (`authLimiter`), AI querying (`aiLimiter`), and general API endpoints.
- **NoSQL Operator Injection Defense**: Recursive sanitization middleware automatically neutralizes `$` and `.` query keys.
- **ReDoS Prevention**: Regex metacharacter neutralization protects dynamic database searches.
- **Timing Attack Mitigation**: Dummy password hashing equalizes response timing for non-existent users during login.
- **URL Sanitization**: User-provided reference links are restricted to `http://` and `https://` schemes, neutralizing `javascript:` and `data:` XSS vectors.
- **Strict Role-Based Access Control (RBAC)**: Enforces boundaries between `member` and `manager` roles, ensuring only authors can edit drafts and preventing demotion of the final active manager account.

## Verification

`npm test` covers role/ownership checks, draft privacy, the complete correction cycle, snapshot preservation, pagination, dashboard filtering, compliance, date boundaries, and project usage counts. Tests run against an isolated database. Frontend compilation is checked with the production build. See [submission preparation](docs/submission-preparation.md) for the presentation outline, camera-on demo checklist and required sharing steps.
