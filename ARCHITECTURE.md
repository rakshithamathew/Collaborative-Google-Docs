# Architecture Note

## System overview

```text
React + Tiptap client
        |
        | HTTP / JSON
        v
Node.js + Express API
        |
        | Mongoose
        v
      MongoDB
```

The project is split into independently runnable `client` and `server` TypeScript applications. The browser owns presentation and local editing state; the API owns validation, demo-user ownership, import processing, and persistence.

## Frontend

The Vite-powered React client uses React Router for the document list and editor routes. The root route opens the dashboard directly and a shared Axios instance calls the API.

The editor loads and writes Tiptap JSON. Title and content changes remain local while a debounced autosave is pending, then are persisted together. Visible saving, saved, and failure states make persistence behavior clear. The documents page separates owned and shared documents, and file import creates a document before navigating to its editor.

## Backend

Express routes delegate to controllers and small domain services. Middleware loads seeded Alice as the implicit demo user and handles request validation, in-memory uploads, 404 responses, and consistent JSON errors. Environment configuration is validated centrally before the server starts.

Mongoose models provide schema validation and timestamps. Every document operation performs authorization on the server:

- Owners can read, edit, delete, share, and remove access.
- Shared users can read and edit.
- Unrelated users cannot access the document.

Uploads are limited to one 5 MB TXT, MD, or DOCX file. Multer keeps the file in memory, parser code converts it into Tiptap JSON, and only the resulting document is persisted.

## Data model

`User` stores a name, normalized unique email, and timestamps.

`Document` stores a title, Tiptap JSON content, one owner reference, an array of shared-user references, and timestamps. Keeping the small access list on the document makes the assignment's ownership checks direct and easy to audit.

## Deployment shape

A production deployment requires three pieces: the built React client, the Node.js API, and a MongoDB database. The client receives the public API base URL through `VITE_API_URL`; the API receives the database URI, allowed client origin, and port through environment variables. No paid service is required: the same topology can run locally with MongoDB Community Edition or Docker.

## Deliberate scope cuts

The application does not include real-time collaboration, conflict resolution, comments, history, notifications, folders, search, registration, or advanced sharing roles. These cuts keep the implementation focused on a reliable document lifecycle, import workflow, and enforceable access model.
