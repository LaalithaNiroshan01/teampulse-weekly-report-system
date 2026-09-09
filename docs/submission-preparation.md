# Submission Preparation & Video Walkthrough Guide

This document outlines the final steps to assemble, record, and submit all deliverables for the **Technical SE Assignment: Weekly Report Generator & Team Dashboard**.

---

## 📦 Required Deliverables Summary (PDF Page 5–6)

| # | Deliverable | Format | Destination | Status |
|---|---|---|---|---|
| **1** | **GitHub Repository** | Public/Private Git URL | Submission Email Body | Ready: [GitHub Repo](https://github.com/LaalithaNiroshan01/teampulse-weekly-report-system) |
| **2** | **Technical Presentation** | Google Slides link | Shared Google Drive Folder | Ready: [Slide Outline](PRESENTATION_SLIDES.md) |
| **3** | **Entity Relationship Diagram** | Image file (SVG/PNG) | Shared Google Drive Folder | Ready: [docs/er-diagram.svg](er-diagram.svg) |
| **4** | **Demo Video** | Video file (.mp4 / Drive link) | Shared Google Drive Folder | To record (using script below) |
| **⭐** | **Live Cloud Deployment** | Public Web URL | Submission Email Body & README | Live: [https://client-vert-nine-30.vercel.app](https://client-vert-nine-30.vercel.app) |

---

## 🎥 Camera-On Demo Video Script (5–7 Minutes)

> [!IMPORTANT]
> **Video Requirement**: Keep your camera on with your face visible throughout the presentation (e.g. using Loom, OBS, or Zoom recording). Stay inside the UI—do not waste time showing raw terminal or database records.

### ⏱️ Timeline & Step-by-Step Flow:

#### 1. Introduction (0:00 – 0:45)
- Introduce yourself and state the project name: **TeamPulse — Weekly Report Generator & Team Dashboard**.
- Mention the technology stack: React 18 (Vite), Tailwind CSS, Node.js (Express), MongoDB Atlas, and Docker.
- Highlight the key architectural highlights: Multi-role RBAC, immutable revision history, compliance analytics, and dual-engine AI assistant.

#### 2. Contributor Workflow — Team Member (0:45 – 1:45)
- Sign in as **`sarah@company.com`** (`Password123!`).
- Navigate to **Report History** (`/reports`) and open Sarah's submitted report for the current week.
- Point out the standardized structure: Task-level table with planned vs. actual %, planned vs. spent time, output deliverables, key issue, key achievement, and hours breakdown.
- Highlight that the report is in **Submitted** status and therefore locked from direct editing.

#### 3. Manager Command Center & Analytics (1:45 – 3:00)
- Log out and sign in as **`alex.manager@company.com`** (`Password123!`).
- Landing page is the **Team Dashboard** (`/dashboard`):
  - Point out the 4 summary metrics: Total Submitted, On-Time Compliance Rate, Reports Needing Correction, and Open Blockers.
  - Demonstrate date range filtering across multiple weeks to show trend lines.
  - Show the **Tasks Completed Trend**, **Project Distribution**, and **Time Spent by Task Type** (Dev vs QA vs Meetings vs Docs).
  - Open the **Side-by-Side View** tab: Show how a manager can inspect all team blockers and key achievements side-by-side without opening individual reports.

#### 4. Complete Correction & Resubmission Cycle (3:00 – 4:30)
- From the dashboard, click to review **Sarah Connor's** report (or navigate to `/review/:reportId`).
- Click **Request Changes**, enter a clear comment: *"Sarah, please add the pull request link to the output deliverables and re-verify testing hours."* and submit.
- The report status updates to **Needs Correction**.
- Log out and log back in as **`sarah@company.com`**:
  - Show the amber feedback banner on her editor page with the manager's comment.
  - Edit a task description, update deliverables, and click **Submit Report**.
- Log back in as **`alex.manager@company.com`**:
  - Open the updated report.
  - Scroll to the **Version History Viewer**: Open **Version 1** to show the original submission and comment, then show **Version 2** with the updated changes.
  - Click **Approve Report** to finalize it.

#### 5. Privacy Boundary & Administrative Capabilities (4:30 – 5:30)
- Demonstrate **Draft Privacy**:
  - Show that **Elena Rostova** has a `Draft` report. Show that clicking it or attempting to access her draft content as a manager is blocked, proving author privacy.
- Open **Project Management** (`/projects`): Show adding/editing project categories and soft-deactivation.
- Open **User Management** (`/users`): Show team member roster, inviting a new member with temporary credentials, and role assignments.

#### 6. AI Reporting Assistant Demo (5:30 – 6:15)
- Click the **AI Assistant** drawer on the navigation bar.
- Ask questions about the team:
  - *"What did Sarah work on this week?"*
  - *"Are there any open blockers across projects?"*
  - *"Give me an executive summary of this week's progress."*
- Point out the engine badge (Gemini 1.5 Flash or TeamPulse Smart Heuristics) and emphasize that unsubmitted drafts are strictly excluded from AI prompts to protect privacy.

#### 7. Conclusion & Automated Tests (6:15 – 7:00)
- Briefly mention the automated test suite: 19/19 passing Jest tests covering RBAC, draft privacy, and state machine transitions.
- Mention the GitHub Actions CI pipeline and live cloud deployment link.
- Thank the committee and invite questions for the live coding round.

---

## 📧 Submission Email Template

Copy and fill in this email template when submitting:

```text
Subject: Technical Assignment Submission - Weekly Report Generator & Team Dashboard - [Your Full Name]

Dear Hiring Committee,

Please find my submission for the Technical SE Assignment: Weekly Report Generator & Team Dashboard (TeamPulse).

1. GitHub Repository:
   https://github.com/LaalithaNiroshan01/teampulse-weekly-report-system

2. Shared Google Drive Folder (Presentation, ER Diagram & Demo Video):
   [INSERT YOUR GOOGLE DRIVE FOLDER LINK HERE - ensure "Anyone with the link can view" is enabled]

3. Live Cloud Application (Bonus):
   - Web Application: https://client-vert-nine-30.vercel.app
   - REST API Health: https://server-nine-eta-57.vercel.app/api/health

4. Key Highlights:
   - Complete 9-View Application: Fully implemented all 9 views requested in Section 7.
   - Robust Review & Correction Cycle: Immutable version snapshots preserving point-in-time state.
   - Dual-Engine AI Assistant: Google Gemini 1.5 Flash + Smart Heuristic fallback with draft privacy.
   - Enterprise Security: Hardened against OWASP Top 10 (Helmet, NoSQL injection prevention, timing attack defense, rate limiting).
   - Automated Verification: 19/19 passing Jest tests running via GitHub Actions CI pipeline.
   - Docker Containerization: 1-command startup available via `docker compose up`.

Universal Demo Account Password: Password123!
- Manager Account: alex.manager@company.com
- Member Account: sarah@company.com

Thank you for your time and consideration. I look forward to the live coding interview!

Sincerely,
[Your Full Name]
[Your Phone Number]
[Your LinkedIn Profile Link]
```

---

## ✅ Final Pre-Submission Checklist

- [ ] **Google Drive Folder Sharing**: Verify the folder sharing permission is set to **"Anyone with the link can view"** (test in an Incognito window).
- [ ] **Google Slides Presentation**: Slide deck uploaded or created in Google Slides.
- [ ] **ER Diagram**: `docs/er-diagram.svg` (or PNG export) uploaded to the Drive folder.
- [ ] **Video File**: Recorded video with face camera enabled uploaded to the Drive folder.
- [ ] **GitHub Repository**: Accessible and up to date on branch `main` or `Development`.
