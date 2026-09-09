# TeamPulse — Demo Accounts & Login Credentials

This document provides all pre-seeded demo user accounts and live environment links for evaluating and presenting the **TeamPulse: Weekly Report Generator & Team Dashboard** platform.

---

## 🌐 Live Cloud Deployment & Local Access

| Environment | URL | Purpose |
|---|---|---|
| **Live Web App (Frontend)** | [https://client-vert-nine-30.vercel.app](https://client-vert-nine-30.vercel.app) | Production web application deployed on Vercel |
| **Live API Health Check** | [https://server-nine-eta-57.vercel.app/api/health](https://server-nine-eta-57.vercel.app/api/health) | Backend REST API running on Vercel |
| **Local Docker Stack** | `http://localhost:3000` | 1-command containerized stack (`docker compose up`) |
| **Local Development** | `http://localhost:5173` | Vite dev server (`npm run dev`) |

> [!IMPORTANT]
> **Universal Demo Password**: **`Password123!`**  
> All demo accounts share this password for immediate, frictionless evaluation.

---

## 1. Manager / Admin Account (Full Administrative & Review Access)

| Field | Value |
|---|---|
| **Full Name** | Alex Rivera |
| **Email** | `alex.manager@company.com` |
| **Password** | `Password123!` |
| **Role** | `Manager / Admin` (`manager`) |
| **Title / Department** | Engineering Manager / Platform Engineering |
| **Key Capabilities** | • Full access to Team Dashboard (`/dashboard`)<br>• Real-time compliance metrics, trends & visual charts<br>• Side-by-Side cross-team blocker & achievement matrix<br>• Manager Review interface (`/review/:reportId`) with Approve / Request Changes<br>• Project category CRUD management (`/projects`)<br>• User roster management & role assignment (`/users`)<br>• AI Assistant conversational insights drawer |

---

## 2. Team Member Accounts (Multi-Role Workflow Scenarios)

Each member account is pre-seeded into a specific real-world report workflow status across the reporting period.

### 📋 1. Sarah Connor — Submitted Report Demo
- **Email**: `sarah@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: Senior Backend Engineer / Platform Engineering
- **Report Status**: **`Submitted`** (Current Week)
- **Demo Purpose**: Demonstrates a complete submitted report ready for manager review. Features a detailed task table (planned % vs actual %, time spent vs planned, deliverables produced), resolved blocker, key achievement flag, and activity hours breakdown.

---

### 🔄 2. David Miller — Correction Cycle & Version History Demo
- **Email**: `david@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: Frontend Engineer / Product Experience
- **Report Status**: **`Needs Correction`** (Current Week)
- **Manager Feedback**: *"Great work on the UI components David, but please break down the output deliverables for the design system tokens and adjust the planned hours for next week."*
- **Demo Purpose**: Ideal for demonstrating the correction workflow. Sign in as David, see the manager's comment highlighted in amber, edit task details, and click **Resubmit Report**. Then switch to Manager to view Version 1 vs Version 2 in the Version History viewer.

---

### 🔒 3. Elena Rostova — Draft Privacy Guarantee Demo
- **Email**: `elena@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: Full Stack Engineer / Platform Engineering
- **Report Status**: **`Draft`** (Current Week)
- **Demo Purpose**: Demonstrates **Draft Privacy (Confidentiality Boundary)**. Elena can view and edit her private work-in-progress draft. On the Manager's dashboard, Elena appears with status `Draft`, but her draft tasks, blockers, and content are strictly inaccessible to the manager (returns `403 Forbidden` if directly inspected).

---

### ⏱️ 4. Marcus Vance — Compliance Tracking & Overdue Demo
- **Email**: `marcus@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: DevOps & QA Engineer / Infrastructure
- **Report Status**: **`Not Started`** (Current Week)
- **Demo Purpose**: Demonstrates compliance tracking. Shows how team members with missing/unstarted reports contribute to the pending and overdue rate calculations on the team dashboard.

---

## 3. Quick Reference Matrix

| Account Name | Email | Password | Role | Current Status | Primary Test Scenario |
|---|---|---|---|---|---|
| **Alex Rivera** | `alex.manager@company.com` | `Password123!` | Manager / Admin | Active | Dashboard analytics, review actions, AI drawer, user management |
| **Sarah Connor** | `sarah@company.com` | `Password123!` | Team Member | Submitted | Inspect complete submitted report, trigger manager review |
| **David Miller** | `david@company.com` | `Password123!` | Team Member | Needs Correction | Review manager comments, edit and resubmit version 2 |
| **Elena Rostova** | `elena@company.com` | `Password123!` | Team Member | Draft (Private) | Verify draft privacy boundary (inaccessible to managers) |
| **Marcus Vance** | `marcus@company.com` | `Password123!` | Team Member | Not Started | Verify compliance calculation (on-time vs pending vs overdue) |

---

## 4. Resetting Sample Data

If you modify or approve reports during interactive testing and want to reset the database back to this clean initial state:
```bash
npm run seed
```
