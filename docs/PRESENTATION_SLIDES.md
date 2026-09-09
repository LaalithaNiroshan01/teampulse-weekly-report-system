# Technical Presentation Slides & Script
**Project**: TeamPulse — Weekly Report Generator & Team Dashboard  
**Role**: Technical Software Engineer Assignment  
**Format**: Google Slides Presentation Outline & Speaker Notes  

---

## Slide 1: Title Slide
- **Title**: TeamPulse
- **Subtitle**: Weekly Report Generator & Team Dashboard
- **Presenter**: [Your Name]
- **Tech Stack**: MongoDB, Express.js, React (Vite), Node.js (MERN) + Tailwind CSS & Recharts

### Speaker Notes:
> "Hello everyone. Today I'm presenting TeamPulse, my solution for the Technical SE Assignment: Weekly Report Generator & Team Dashboard. The goal was to build a complete, resilient internal web tool enabling individual team members to submit standardized weekly reports, while giving managers real-time analytics, compliance tracking, and a robust review/correction workflow."

---

## Slide 2: System Architecture Overview
- **Client Tier**:
  - React 18 with Vite for ultra-fast HMR and bundle compilation.
  - Tailwind CSS for modern design system and accessible color contrast tokens.
  - React Router v6 with strict route protection and role-aware navigation.
  - Recharts for data-driven analytics and time-series charting.
- **Server Tier**:
  - Node.js & Express REST API structured into Clean Controllers, Middleware, Models, and Validation.
  - JWT session token authentication with bcrypt password hashing (10 salt rounds).
  - Centralized Error Handling and strict server-side validation using `express-validator`.
- **Database Tier**:
  - MongoDB with Mongoose ODM.
  - Dual-mode connection: connects seamlessly to external MongoDB Atlas or local daemon, with an automatic in-memory fallback (`mongodb-memory-server`) for zero-friction evaluation.

### Speaker Notes:
> "On the architecture side, I chose a clean MERN stack. On the frontend, React 18 with Vite and Tailwind CSS ensures an intuitive, responsive UI. On the backend, Express routes are decoupled from controllers and database models. One key architectural touch is our zero-config database strategy: if no external MongoDB URI is provided, the backend seamlessly boots an in-memory MongoDB instance with pre-seeded demo data, guaranteeing that the evaluator can clone and run the application instantly."

---

## Slide 3: Role-Based Access Control (RBAC) & Draft Privacy
- **Two Role Values**:
  - `member`: Displayed as **Team Member**
  - `manager`: Displayed as **Manager / Admin** (handles reviews, user roster, role assignment, project categories)
- **Draft Privacy Model**:
  - The team dashboard tracks submission status (`draft`, `submitted`, `needs_correction`, `approved`, `not_started`) to calculate compliance metrics.
  - **Core Privacy Guarantee**: Draft content (tasks, deliverables, blockers) is private to the author. Managers cannot inspect draft details, and attempting to fetch a draft returns `403 Forbidden`.
- **Content Integrity Guarantee**:
  - Managers can review and comment, but **cannot rewrite** member report content.

### Speaker Notes:
> "A core requirement of the assignment was balancing team visibility with draft privacy. In our system, the manager's dashboard tracks who has started a draft so that compliance is accurate, but the draft content itself is strictly locked to the author. Furthermore, the system enforces non-repudiation: managers cannot tamper with or rewrite a member's report—they can only approve or request changes with feedback."

---

## Slide 4: Database Design & Entity Relationship (ER) Model
- **Core Entities**:
  - `User`: Name, email, hashed password, role (`member` | `manager`), title, department, active status.
  - `Project`: Name, description, color tag, active status, assigned team members.
  - `Report`: UserId, WeekStartDate, WeekEndDate, WeekNumber, Year, ProjectId, Status, Standardized task arrays, Hours breakdown, Latest review comments, and `versions` snapshots.
  - `ReportVersion`: VersionNumber, SubmittedAt, Frozen Snapshot JSON, ReviewAction, ReviewComment, ReviewedBy, ReviewedAt.

*(Include the Mermaid ER Diagram from the README or diagram image)*

### Speaker Notes:
> "Our schema design reflects both relational references and document embedding. The Report model embeds standardized subdocuments for completed tasks, planned tasks, blockers, and achievements. Most importantly, each submission stores a full snapshot subdocument inside the `versions` array. This ensures that when a report goes through multiple review cycles, previous versions are permanently preserved and never overwritten."

---

## Slide 5: Standardized Personal Weekly Report Schema
- **Fixed, Uniform Schema** across every team member:
  1. **Week Date Range**: Start/End dates, Week number, Year
  2. **Project / Category**: Categorization tag
  3. **Tasks Completed Table**: Task name, priority, planned % vs actual %, status, planned hours vs spent hours, output deliverable
  4. **Tasks Planned for Next Week**: Priority, estimated time, expected milestones
  5. **Blockers & Challenges**: Impact description + Radio toggle for **Key Issue of the Week**
  6. **Achievements & Highlights**: Breakthroughs + Radio toggle for **Key Achievement of the Week**
  7. **Hours Breakdown (Optional)**: Development, Testing, Meetings, Documentation, Other
  8. **Notes & Links (Optional)**: Context & PR links
- **Validation Philosophy**:
  - Incomplete drafts are permitted during authoring.
  - Full schema validation is strictly enforced upon formal submission.

### Speaker Notes:
> "To guarantee comparability on the manager dashboard, the report form has an identical structure for every user. Key constraints are built directly into the UI: for example, radio toggles enforce that only one blocker can be flagged as the key issue for the week, and only one achievement can be flagged as the key highlight. We also separate partial draft saving from strict submission validation."

---

## Slide 6: Multi-Cycle Review & Correction Workflow
- **State Flow**:
  - `Draft` → `Submitted` (Member submits → generates Version 1 Snapshot)
  - `Submitted` → `Needs Correction` (Manager requests changes with mandatory comment)
  - `Needs Correction` → `Submitted` (Member sees feedback, edits working copy, resubmits → generates Version 2 Snapshot)
  - `Submitted` → `Approved` (Manager approves submitted version)
- **Immutable Version Audit Trail**:
  - Review comments are associated with the exact version reviewed.
  - Interactive Version Timeline allows inspecting historical snapshots on demand.
  - Visual diffs are replaced with clean, on-demand snapshot inspection as specified in the assignment.

### Speaker Notes:
> "The review workflow is the interactive heartbeat of this tool. When a manager requests changes, the report enters 'Needs Correction' and the feedback banner appears prominently on the member's editor. When the member resubmits, the previous version isn't overwritten—it becomes Version 1 in the audit trail, and the new submission becomes Version 2. This gives the team a clear historical record."

---

## Slide 7: Team Dashboard & Visual Insights
- **Key Summary Metrics**:
  - Total Reports Submitted
  - Submission Compliance Rate (Submitted vs Pending vs Late)
  - Reports in Needs Correction
  - Open Team Blockers
- **Visual Charts (Recharts)**:
  - Tasks Completed Velocity Trend over recent weeks
  - Workload & Task Distribution by Project
  - Team Time Allocation by Activity Type (Dev, Testing, Meetings...)
  - Submission & Approval Status Breakdown by Member
- **Team Submission Matrix**:
  - Live matrix tracking every member for the selected week.
  - Automatically derives **'Not yet started'** when a member hasn't created a report.
- **Side-by-Side Comparison (Bonus Feature)**:
  - Compare Blockers or Achievements across all team members side by side.

### Speaker Notes:
> "On the Manager Dashboard, managers get high-level operational visibility without compromising privacy. The compliance formula tracks submitted, pending, and late reports. The submission matrix shows everyone on the team, dynamically computing 'Not Started' for members with no record. Managers can also click 'Side-by-Side View' to scan all team blockers or achievements across members in one modal without opening each report individually."

---

## Slide 8: Key Frontend Views (All 9 Views Implemented)
1. **Shared Login / Register Page** (`/login`, `/register`) with 1-click demo logins
2. **Personal Weekly Report Create / Edit Page** (`/reports/new`, `/reports/:id/edit`)
3. **Personal Report History Page** (`/reports`)
4. **Read-Only Report Detail Page** (`/reports/:id`) with Print & Snapshot viewer
5. **Team Member Profile Page** (`/team/:userId`) with member stats & report history
6. **Project / Category Management Page** (`/projects`) with full CRUD and member assignment
7. **User Management Page** (`/users`) with role assignment & invite credentials
8. **Manager Review Page** (`/review/:id`) with Approve & Request Changes
9. **Team Dashboard** (`/dashboard`)
10. **Bonus AI Assistant Drawer** (`/api/ai/chat`)

### Speaker Notes:
> "Section 7 of the assignment asked for at least 7 views. We built all 8 listed views plus the Team Dashboard, totaling 9 complete views. All views are connected to real backend endpoints—there are no hardcoded mocks."

---

## Slide 9: AI Assistant Copilot (Good to Have)
- **Architecture**:
  - Server-side NLP summarizer and query synthesizer in `aiController.js`.
  - In-app slide-out drawer accessible from the top navbar.
- **Capabilities**:
  - Context-aware executive weekly summaries.
  - Instant extraction of team blockers and escalated key issues.
  - Workload and hours breakdown across projects and activity types.
  - Built-in smart heuristics fallback ensures 100% offline availability during evaluations without requiring external API keys.

### Speaker Notes:
> "We also implemented the optional AI Chat Assistant. Accessible from the navigation bar, it ingests the current week's submitted reports and answers questions about blockers, deliverables, and hours. It features a built-in NLP pipeline so that it works out of the box even without paid third-party API keys."

---

## Slide 10: Challenges Faced & Solutions
1. **Challenge: Reconciling Draft Privacy with Dashboard Submission Tracking**
   - *Solution*: Designed a dual-level serialization strategy where dashboard aggregations inspect status metadata, while endpoints returning report content strictly enforce author ownership.
2. **Challenge: Preserving Version Snapshots Without Concurrency Conflicts**
   - *Solution*: Implemented an append-only snapshot array embedded within the report document, ensuring atomic version updates during submission and review without race conditions.
3. **Challenge: Zero-Dependency Evaluation for Reviewers**
   - *Solution*: Embedded `mongodb-memory-server` with an auto-seed bootstrap, enabling reviewers to run the full application with a single command even without MongoDB installed.

### Speaker Notes:
> "One of our main design challenges was reconciling draft privacy with compliance metrics. We solved this cleanly by separating status telemetry from content serialization. Another key decision was the embedded snapshot engine, which guarantees data immutability during repeat review cycles without needing complex table joins."

---

## Slide 11: Possible Future Improvements
- **Real-Time Push Notifications**: WebSockets or Server-Sent Events (SSE) for instant alerts when changes are requested.
- **Granular Line-Item Comments**: Ability for managers to leave comments on specific task rows in addition to the general review comment.
- **Automated Reminder Cron Jobs**: Automated email/Slack reminders to members whose reports are in 'Not Started' on Friday afternoons.
- **Export to PDF / CSV**: Native PDF generation with company letterhead for executive reporting.

---

## Slide 12: Q&A / Live Demo
- **Demonstration Highlights**:
  - 1-Click Login as Manager Alex & Member Sarah/David
  - Completed review cycle with version history
  - Live review action (Request changes with comment → Resubmit → Approve)
  - Team Dashboard metrics & side-by-side comparison
  - Automated RBAC test suite execution (`npm test`)

### Speaker Notes:
> "Thank you for your time. I am excited to demonstrate the application live and walk through the code."
