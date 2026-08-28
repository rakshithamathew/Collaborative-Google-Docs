# Submission Manifest

## Reviewer links

- Google Drive folder: **Pending external upload**
- Live product: **Pending deployment**
- Walkthrough video: see `walkthrough-video-url.txt` (**pending recording/upload**)

These values are intentionally not fabricated. Replace each pending item only after its corresponding external resource is available.

## Included materials

- `client/` — React, TypeScript, Vite, Tailwind CSS, Tiptap frontend
- `server/` — Express, TypeScript, Mongoose API and focused backend tests
- `README.md` — product overview, exact local setup, environment variables, credentials, behavior, and limitations
- `ARCHITECTURE.md` — system, data, security, import, and deployment architecture
- `AI_WORKFLOW.md` — tools used, acceleration, rejected/revised output, and verification approach
- `WALKTHROUGH_SCRIPT.md` — timed script and recording checklist for a 3–5 minute demo
- `walkthrough-video-url.txt` — location for the final unlisted video URL
- `SUBMISSION.md` — this manifest and handoff status
- `.gitignore`, `client/.env.example`, and `server/.env.example` — repository and environment setup files

Generated dependency folders, build output, real `.env` files, database data, and secrets are not submission artifacts.

## Demo accounts

| User | Email |
| --- | --- |
| Alice | `alice@demo.example` |
| Bob | `bob@demo.example` |
| Charlie | `charlie@demo.example` |

The dashboard operates directly as Alice. Bob and Charlie exist as sharing-list targets, but account switching is not available.

## What works

- Direct single-user dashboard using seeded Alice as the implicit owner
- Owned/shared document lists with loading and empty states
- Create, open, rename, rich-text edit, autosave, refresh, and reopen
- TXT, MD, and DOCX import into new editable documents
- Owner-managed sharing and access removal
- Owner-managed sharing-list updates
- Focused backend integration tests and production frontend build

## Incomplete delivery steps

The application functionality is complete within the selected scope. Three external delivery steps remain pending in this local workspace: production hosting, recording/uploading the walkthrough, and uploading the final materials to Google Drive.

With another 2–4 hours, I would deploy the API and client with production environment variables and a hosted MongoDB instance, seed the review accounts, run the full reviewer journey against that deployment, record the supplied walkthrough, and upload a clean source package plus documentation to the Drive folder. I would not use that time to add optional product features before the delivery path is verified.

## Local evaluation

Follow `README.md` for exact installation, environment, MongoDB, seed, and startup commands. For the quickest code-level verification, run:

```bash
npm test --prefix server
npm run build --prefix server
npm run build --prefix client
```
