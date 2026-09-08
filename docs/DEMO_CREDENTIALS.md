# TeamPulse — Demo Accounts & Login Credentials

This document lists all pre-seeded demo user accounts available for evaluating and presenting the **TeamPulse: Weekly Report Generator & Team Dashboard** application.

> [!NOTE]
> All demo accounts share the common development password: **`Password123!`**  
> These accounts and sample weekly reports are automatically populated in the MongoDB database when running `npm run seed`.

---

## 1. Manager / Admin Account (Full Administrative & Review Access)

| Field | Value |
|---|---|
| **Full Name** | Alex Rivera |
| **Email** | `alex.manager@company.com` |
| **Password** | `Password123!` |
| **Role** | `Manager / Admin` (`manager`) |
| **Title / Department** | Engineering Manager / Platform Engineering |
| **Key Capabilities** | • Access to Team Dashboard (`/dashboard`)<br>• Real-time compliance metrics, trends & charts<br>• Side-by-side blocker & achievement viewer<br>• Manager Review page (`/review/:reportId`) with Approve / Request Changes<br>• Project CRUD management (`/projects`)<br>• User management & role assignment (`/users`)<br>• AI Assistant Q&A Drawer |

---

## 2. Team Member Accounts (Individual Reporting Access)

Each member account demonstrates a unique real-world report workflow status across the reporting period.

### 👤 Sarah Connor — (Submitted Report Demo)
- **Email**: `sarah@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: Senior Backend Engineer / Platform Engineering
- **Report Status**: **`Submitted`** (Current Week)
- **Demo Purpose**: Shows a complete submitted report ready for manager review. Demonstrates task-level breakdown (5 tasks with %, time planned vs spent, deliverables), resolved blocker, key achievement flag, and task hours breakdown.

---

### 👤 David Miller — (Needs Correction & Version History Demo)
- **Email**: `david@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: Frontend Engineer / Product Experience
- **Report Status**: **`Needs Correction`** (Current Week)
- **Manager Feedback**: *"Great work on the UI components David, but please break down the output deliverables for the design system tokens and adjust the planned hours for next week."*
- **Demo Purpose**: Perfect for demonstrating the correction workflow. Log in as David, see the manager's comment highlighted in amber, edit tasks, and click **Resubmit Report**. Then switch to Manager to view Version 1 vs Version 2 in the Version History viewer.

---

### 👤 Elena Rostova — (Draft Privacy Demo)
- **Email**: `elena@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: Full Stack Engineer / Platform Engineering
- **Report Status**: **`Draft`** (Current Week)
- **Demo Purpose**: Demonstrates **Draft Privacy**. Elena can view and edit her private draft. On the Manager's dashboard, Elena appears with status `Draft`, but her draft tasks and content are strictly inaccessible to the manager (returns `403 Forbidden` if accessed directly).

---

### 👤 Marcus Vance — (Pending / Overdue Compliance Demo)
- **Email**: `marcus@company.com`
- **Password**: `Password123!`
- **Role**: `Team Member` (`member`)
- **Title / Department**: DevOps & QA Engineer / Infrastructure
- **Report Status**: **`Not Started`** (Current Week)
- **Demo Purpose**: Demonstrates compliance tracking. Shows how missing/unstarted reports contribute to the pending and overdue rates on the team dashboard.

---

## 3. Quick Reference Table

| Account Name | Email | Password | Role | Current Status |
|---|---|---|---|---|
| **Alex Rivera** | `alex.manager@company.com` | `Password123!` | Manager / Admin | Full Admin |
| **Sarah Connor** | `sarah@company.com` | `Password123!` | Team Member | Submitted |
| **David Miller** | `david@company.com` | `Password123!` | Team Member | Needs Correction |
| **Elena Rostova** | `elena@company.com` | `Password123!` | Team Member | Draft (Private) |
| **Marcus Vance** | `marcus@company.com` | `Password123!` | Team Member | Not Started |

---

## 4. Resetting Sample Data
If you modify reports during testing and want to reset the database back to this clean initial state:
```bash
npm run seed
```
