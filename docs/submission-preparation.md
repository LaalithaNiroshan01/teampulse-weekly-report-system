# Submission preparation

## Google Slides content outline

Create the final presentation in Google Slides. This is the content outline, not a claim that a shared Slides file already exists.

1. **Problem and solution** — consistent weekly reporting, a repeatable correction cycle and management visibility. Two roles share one login.
2. **Architecture** — React/Vite client → Express REST endpoints → Mongoose/MongoDB. Reusable form components, protected endpoints and centralized analytics rules.
3. **Database** — Users author Reports; Projects categorize Reports; each Report embeds submission Versions. Each version contains a full snapshot and its review action/comment/reviewer/timestamps. Show er-diagram.svg.
4. **Frontend** — distinguish the personal editor, paginated history, read-only detail, manager review and team dashboard. Show project management, member profile and user management.
5. **Authorization** — member ownership is checked server-side. Draft content is private. Managers can review but cannot rewrite content. Registration cannot grant management privileges.
6. **Correction workflow** — show v1 submission → change request/comment → working edit → v2 resubmission → approval. Open v1 and show its preserved original content.
7. **Analytics** — ISO weeks in UTC; first submission time; member/week compliance; correction reports still count; date/member/project filters; unresolved blockers; chronological activity.
8. **Challenges and fixes** — partial version rendering, history truncation, duplicate-report compliance inflation, draft/correction isolation, persistent storage and mandatory JWT configuration.
9. **Validation** — demonstrate automated tests and the build; explain what each regression test protects. Show behavior in the UI rather than raw database queries.
10. **Limitations and future improvements** — current roster for historic compliance, manual temporary-credential invitations, browser-stored JWT, optional external AI. Summary Helper is rule-based, and does not use an AI model or transmit report data externally.

## Camera-on demo script (about 5–7 minutes)

- Turn on your camera and keep your face visible while presenting.
- Explain the two roles and shared login.
- Sign in as Sarah; open personal history and show a report's fields.
- Sign in as Alex; show current dashboard and a date range spanning multiple weeks. Apply a member/project filter and show matching charts.
- Open Sarah's submitted report. Request Changes with an explanatory comment.
- Sign back in as Sarah; show the comment, change notes or deliverable text, resubmit.
- Sign in as Alex; open v1 and v2 and point out the original content and comments. Approve v2.
- Show David and Elena/Marcus profiles or report status to establish at least 2–3 real members. Draft content must remain private.
- Show project management and account deactivation/role assignment without changing your only manager account.
- Show the optional rule-based Summary Helper accurately; do not claim an LLM integration.
- Finish with tests, architecture decisions and a small code change you can explain for the live interview.

## Required submission checklist

- [ ] GitHub repository contains frontend, backend and setup README.
- [ ] Final presentation is created in Google Slides.
- [ ] ER diagram image is included (`er-diagram.svg`; PNG export may also be used).
- [ ] Demo video is recorded with camera on and face visible.
- [ ] One Google Drive folder contains the presentation, diagram and video.
- [ ] Folder sharing is “Anyone with the link”.
- [ ] Links work in a signed-out browser.
- [ ] Submission email contains the GitHub link and shared Drive folder link.
- [ ] You can explain and modify the code during the live coding round.

Google Slides creation/sharing, personal video recording, Drive uploads and submission email are manual/external steps not completed by these local files. Public hosting and actual LLM integration are optional.
