# Technical Presentation Slides & Script

**Project**: TeamPulse — Weekly Report Generator & Team Dashboard  
**Role**: Technical Software Engineer Assignment  
**Format**: Google Slides Presentation Outline & Speaker Notes  
**Live Demo Web App**: [https://client-vert-nine-30.vercel.app](https://client-vert-nine-30.vercel.app)  
**GitHub Repository**: [https://github.com/LaalithaNiroshan01/teampulse-weekly-report-system](https://github.com/LaalithaNiroshan01/teampulse-weekly-report-system)  

---

## Slide 1: Title Slide & Project Overview
- **Title**: TeamPulse
- **Subtitle**: Enterprise Weekly Report Generator & Team Dashboard
- **Presenter**: [Your Name]
- **Tech Stack**: MongoDB Atlas, Express.js, React 18 (Vite), Node.js (MERN) + Tailwind CSS, Docker, Vercel
- **Live Deployment**: https://client-vert-nine-30.vercel.app

### Speaker Notes:
> "Hello everyone. Today I am presenting TeamPulse, my solution for the Technical SE Assignment: Weekly Report Generator & Team Dashboard. The goal was to build a resilient, production-grade internal web platform that empowers individual team members to submit structured weekly reports, while giving managers real-time analytics, compliance tracking, a robust review/correction workflow, and an AI reporting assistant. The entire stack is deployed live on Vercel with automated GitHub Actions CI/CD."

---

## Slide 2: System Architecture & Modern Tech Stack
- **Frontend Architecture**:
  - React 18 powered by Vite for instant Hot Module Replacement and production chunk minification.
  - Tailwind CSS utilizing a custom 'Obsidian Slate' enterprise design system with accessible contrast tokens.
  - React Router v6 with declarative route guards enforcing Role-Based Access Control (RBAC).
  - Recharts for interactive compliance tracking and workload visualization.
- **Backend Architecture**:
  - Node.js & Express RESTful API with decoupled Controllers, Models, Routes, and Services.
  - Stateless JWT authentication with bcrypt password hashing (10 salt rounds).
  - Centralized error handling and parameter validation using `express-validator`.
- **Database & DevOps Infrastructure**:
  - MongoDB Atlas cloud cluster with persistent WiredTiger engine.
  - Dual-mode database layer: connects seamlessly to Atlas in production, with an isolated in-memory DB fallback for automated unit testing.
  - Multi-container Docker stack (`docker-compose.yml`) enabling 1-command local evaluation (`docker compose up`).

### Speaker Notes:
> "On the architecture side, I selected a clean, modern MERN stack. On the frontend, React 18 with Vite provides a sub-second developer experience and snappy client-side navigation. On the backend, Express routes are modularized from business controllers. For deployment flexibility, the application is containerized with Docker Compose, tested with automated GitHub Actions CI pipelines, and deployed live to the cloud."

---

## Slide 3: Database Design & Entity Relationships
- **Core Data Entities**:
  - `User`: Unique email, bcrypt password hash, role (`member` | `manager`), title, department, active status.
  - `Project`: Unique name, description, color badge, active status, assigned team members array.
  - `Report`: UserId, WeekStartDate, WeekEndDate, WeekNumber, Year, ProjectId, Status (`draft`, `submitted`, `needs_correction`, `approved`), tasks completed, planned tasks, blockers, achievements, hours breakdown, latest review metadata, and embedded `versions` array.
  - `ReportVersion` (Embedded Subdocument): VersionNumber, SubmittedAt, Frozen Snapshot JSON, ReviewAction, ReviewComment, ReviewedBy, ReviewedAt.
- **Design Decisions**:
  - **Embedded Snapshots**: Storing frozen submission snapshots inside the Report document preserves historical point-in-time state without complex multi-collection joins.
  - **Referential Integrity & Soft Deletion**: Projects with existing reports are archived (`isActive = false`) rather than hard-deleted to safeguard historical auditability.

### Speaker Notes:
> "Our database schema is designed around auditability and data integrity. Rather than overwriting a report when a member resubmits, each submission appends an immutable point-in-time snapshot into the report's `versions` array. This mirrors real-world enterprise change-management systems. Furthermore, users and projects use soft-deactivation so that historical analytics remain accurate even after organizational restructuring."

---

## Slide 4: Frontend UI Architecture (All 9 Views Implemented)
- **Full Scope Implementation (Exceeding the required 7 views)**:
  1. **Authentication**: Unified Login & Register with role selection (`/login`, `/register`).
  2. **Personal Report Editor**: Standardized weekly report editor with task table, key issue/achievement flags, hours breakdown, and reference links (`/reports/new`, `/reports/:id/edit`).
  3. **Report History**: Filterable, paginated personal report portfolio (`/reports`).
  4. **Report Detail View**: Read-only single report inspector with immutable version history viewer (`/reports/:id`).
  5. **Manager Review Page**: Dedicated review workflow interface with one-click Approve / Request Changes actions (`/review/:id`).
  6. **Team Dashboard**: High-level manager command center featuring compliance metrics, trend charts, and activity timeline (`/dashboard`).
  7. **Project Management Page**: Full CRUD page for work streams and member assignments (`/projects`).
  8. **User Management (Admin)**: Member roster, team invitation with temporary credentials, role updates, and account deactivation (`/users`).
  9. **Member Profile Page**: Manager view of individual member throughput, hours logged, and report portfolio (`/team/:userId`).

### Speaker Notes:
> "The assignment prompt required implementing at least 7 distinct pages. I implemented all 9 requested views to deliver a complete product experience. The navigation shell features a stationary sidebar, responsive drawer for mobile, and a clear visual separation between the personal contributor workflow and the managerial oversight dashboard."

---

## Slide 5: Report Review & Correction Workflow (Section 3 Requirement)
- **Strict Four-State Machine**:
  - `Draft`: Work-in-progress, editable by author, **strictly private** (returns `403 Forbidden` if accessed by non-authors).
  - `Submitted`: Locked from editing, pending review on manager dashboard, creates a frozen Version Snapshot.
  - `Needs Correction`: Manager leaves feedback; report becomes editable again by author; feedback highlighted in amber banner.
  - `Approved`: Manager signs off; report is permanently finalized.
- **Content Integrity Guarantee**:
  - Managers can approve or request changes with general feedback, but **cannot rewrite or alter** the member's submitted tasks and hours.
- **Version History Viewer**:
  - Allows inspecting past versions side-by-side with timestamps, reviewer comments, and deliverable differences.

### Speaker Notes:
> "The review and correction cycle is the heart of TeamPulse. When a report is submitted, its exact state is frozen as Version 1. If a manager requests corrections, the member sees the feedback clearly on their editor, updates the tasks, and resubmits, creating Version 2. Both versions remain permanently inspectable in the version viewer, guaranteeing that managers and auditors can see exactly what changed and against which version comments were made."

---

## Slide 6: Team Dashboard & Visual Insights
- **Key Summary Metrics**:
  - Total reports submitted this week.
  - On-time submission compliance rate (Submitted on-time vs Pending vs Late).
  - Number of reports currently in Needs Correction.
  - Total open unresolved blockers across the team.
- **Data-Driven Visual Insights (Recharts)**:
  - **Tasks Completed Trend**: 4-week moving completion volume.
  - **Project Workload Distribution**: Task allocation and total hours logged per project.
  - **Time Allocation by Task Type**: Team-wide hours spent on Development, Testing, Meetings, and Documentation.
  - **Member Submission Matrix**: Tabular status grid showing each member's submission state for any selected week.
- **Bonus Feature — Side-by-Side Cross-Team View**:
  - Allows managers to view blockers and key achievements across all team members side-by-side on a single screen without opening individual reports.

### Speaker Notes:
> "The Team Dashboard aggregates data to give engineering managers immediate operational visibility. Compliance is calculated strictly by member/weeks relative to the Monday 00:00 UTC deadline. In addition to visual charts for time spent and project distribution, I implemented the bonus 'Side-by-Side View', which lets managers scan all team blockers and key accomplishments simultaneously during standups."

---

## Slide 7: AI Reporting Assistant (Dual-Engine Architecture)
- **Dual-Engine Implementation**:
  - **Live Generative LLM Engine**: Native REST integration with **Google Gemini 1.5 Flash** and **OpenAI GPT-4o Mini** configured via environment variables.
  - **Autonomous Smart Heuristic Engine**: Automatically engages if no API key is provided, analyzing blockers, workloads, and individual output locally without external network dependencies.
- **Enterprise Data Privacy**:
  - **Draft Isolation**: Unsubmitted drafts are permanently filtered out from AI context prompts. Only authorized, submitted reports are ingested.
- **UI Transparency**:
  - Displays a live badge indicating which engine generated the response (Gemini 1.5 Flash, GPT-4o Mini, or TeamPulse Intelligence Engine).

### Speaker Notes:
> "For the optional AI assistant feature, I implemented a resilient dual-engine architecture. When API keys are supplied, it leverages Google Gemini 1.5 Flash or OpenAI GPT-4o Mini to answer complex questions about team activity. Crucially, if an evaluator runs the app without API keys, it gracefully falls back to a built-in smart heuristic engine so the assistant never crashes. It strictly adheres to enterprise privacy by excluding unsubmitted drafts from the LLM prompt."

---

## Slide 8: Security Architecture & OWASP Hardening
- **HTTP Security Headers**: Powered by `helmet` to mitigate MIME-sniffing, cross-site scripting, and clickjacking attacks.
- **Technology Fingerprint Masking**: `x-powered-by` header disabled to prevent runtime exposure.
- **NoSQL Operator Injection Defense**: Recursive sanitization middleware automatically strips `$` and `.` query keys from incoming payloads.
- **Timing Attack Mitigation**: Login controller executes dummy bcrypt comparisons when an account does not exist, eliminating response timing differences and preventing user enumeration.
- **ReDoS Prevention**: Project searches use escaped regex metacharacters to eliminate Regular Expression Denial of Service risks.
- **Rate Limiting**: Configured `express-rate-limit` protecting auth endpoints (30 attempts/15 min), AI querying (60 req/min), and global API traffic.
- **URL Protocol Sanitization**: User-supplied reference links are strictly verified to use `http://` or `https://`, neutralizing `javascript:` XSS vectors.

### Speaker Notes:
> "Security was a first-class priority rather than an afterthought. The API implements defenses against the OWASP Top 10: NoSQL injection sanitizers strip query operators, timing attacks are mitigated with dummy bcrypt hashes to prevent user enumeration, and strict rate limiting protects against brute force attacks. All external documentation links are validated to prevent malicious script injection."

---

## Slide 9: Technical Challenges & Engineering Solutions
- **Challenge 1: Version snapshot preservation during multi-round reviews**.
  - *Solution*: Embedded version subdocuments freezing both report content and associated project identity at submission time.
- **Challenge 2: Multi-timezone ISO week compliance calculations**.
  - *Solution*: Standardized on UTC Monday-to-Sunday ISO-8601 week derivations with a fixed deadline of Monday 00:00 UTC. Resubmissions preserve the initial submission timestamp for accurate on-time scoring.
- **Challenge 3: Offline evaluator accessibility for AI features**.
  - *Solution*: Dual-engine pattern where the system automatically degrades to offline heuristics if cloud LLM providers are unreachable.
- **Challenge 4: Cold-start database connection management on serverless**.
  - *Solution*: Connection caching and middleware pre-flight verification to prevent buffering timeouts during serverless execution.

### Speaker Notes:
> "During development, several real-world technical challenges arose. Handling compliance across year boundaries and week 53 required strict UTC ISO week arithmetic. Preserving historical snapshots required isolating submitted versions from active correction drafts. And ensuring seamless testing for evaluators required intelligent fallback mechanisms across both database and AI layers."

---

## Slide 10: Verification, Deliverables & Roadmap
- **Automated Verification**:
  - 19/19 Passing Jest test suite covering RBAC, draft privacy, state transitions, analytics periods, and seed data.
  - Automated CI/CD pipeline running on GitHub Actions on every push.
  - Production frontend build validated with 0 errors via Vite.
- **Submission Deliverables Checklist**:
  - [x] Production GitHub Repository with complete frontend and backend code.
  - [x] Official Entity Relationship Diagram (`docs/er-diagram.svg`).
  - [x] Google Slides Presentation Deck.
  - [x] 5-Minute Video Walkthrough with face camera enabled.
  - [x] Live cloud deployment URLs & 1-command Docker Compose setup.
- **Future Roadmap**:
  - Real-time WebSocket notifications for review comments.
  - One-click PDF & CSV export for weekly executive briefings.
  - Calendar integration (Google Calendar & Outlook) for meeting hours auto-fill.

### Speaker Notes:
> "To conclude, TeamPulse meets 100% of the core requirements and all optional bonus criteria. The solution is backed by 19 automated tests, a continuous integration pipeline, and a live cloud deployment. Thank you for your time, and I welcome any questions or live code walkthroughs."
