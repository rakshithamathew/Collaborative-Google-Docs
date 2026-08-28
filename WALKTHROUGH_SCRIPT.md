# Walkthrough Video Script

Target duration: approximately 4 minutes.

## 0:00–0:25 — Product and scope

Introduce the app as a lightweight document editor focused on rich-text persistence, file import, and a simple sharing list. Note that authentication, real-time co-editing, comments, history, and advanced permissions are not part of the current single-user demo.

## 0:25–0:50 — Documents dashboard

Open the application directly on the dashboard. Explain that the demo operates implicitly as seeded Alice, then show the Owned documents and Shared documents sections and their empty states if applicable.

## 0:50–1:40 — Create, edit, and persist

Create a document. Rename it, enter a heading and paragraph, apply bold or italic formatting, and add a list. Point out the Saving and Saved indicators. Refresh the page, return to the document list, reopen the document, and confirm the title, content, and formatting persisted.

## 1:40–2:10 — Import

Return to Documents, select Import file, and point out the TXT, MD, and DOCX support message. Import a small Markdown file, show that a new document opens automatically, and edit the imported content to demonstrate that it entered the normal document workflow.

## 2:10–2:50 — Share as owner

Open Share, identify Alice as owner, and share the document with `bob@demo.example`. Show Bob in the access list. Explain that the owner can edit, delete, share, and remove access, while a shared user can only read and edit.

## 2:50–3:25 — Sharing scope

Remove Bob from the sharing list. Explain that account switching and authenticated shared-user sessions were removed in favor of opening directly on a single-user dashboard, so this demo covers owner-managed sharing-list persistence rather than a second-user login flow.

## 3:25–4:00 — Implementation and AI workflow

Briefly show the `client` / `server` split and explain that Tiptap JSON is stored through Mongoose in MongoDB, seeded Alice supplies document ownership, and uploads are parsed in memory. Close by noting that Codex accelerated scaffolding and focused tests, while generated suggestions outside scope were rejected and all accepted work was verified with builds and integration tests.

## Recording checklist

- Keep browser zoom and text readable.
- Avoid displaying `.env` files or database credentials.
- Record at 1080p if possible.
- Upload as an unlisted Loom or YouTube video.
- Replace the pending value in `walkthrough-video-url.txt` with the final URL.
