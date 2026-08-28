# Collaborative Document Editor

## Project overview

Collaborative Document Editor is a lightweight, Google Docs-inspired web application for creating, editing, importing, and sharing rich-text documents. It opens directly on a single-user demo dashboard backed by the seeded Alice account.

Documents are saved automatically as Tiptap JSON in MongoDB. The project intentionally focuses on the core assignment workflow rather than real-time collaboration or advanced document-management features.

## Features

- Create new documents with default titles and empty content
- Edit document content in a Tiptap rich-text editor
- Rename documents
- Apply headings, bold, italic, and list formatting
- Persist title, content, ownership, and sharing data in MongoDB
- Autosave document changes with visible save status
- Import TXT, Markdown, and DOCX files as new editable documents
- Share documents with seeded users by email
- Remove shared access
- Distinguish owned documents from shared documents

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Tiptap
- React Router
- Axios

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- multer
- mammoth

### File support

- TXT
- MD
- DOCX

## Architecture

The repository contains two independent TypeScript applications:

```text
client/  React frontend
server/  Express API and MongoDB integration
```

The React client uses Axios to call the Express API. The API loads the seeded Alice demo user as the implicit owner and reads or writes data through Mongoose. MongoDB stores users and document content; uploaded files are processed in memory and are not retained on disk.

## Data model

### User

A user contains a name, normalized unique email address, and timestamps.

### Document

A document contains:

- `title`
- `content` stored as Tiptap JSON
- `owner`, referencing one User
- `sharedWith`, containing User references
- creation and update timestamps

## Local setup

### Prerequisites

- Node.js
- npm
- MongoDB, either installed locally or available through Docker

### 1. Install dependencies

From the repository root:

```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment variables

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

macOS or Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Start MongoDB

If MongoDB is installed locally:

```bash
mongod
```

Alternatively, start MongoDB with Docker:

```bash
docker run --name collaborative-docs-mongo -p 27017:27017 -d mongo:8
```

### 4. Seed demo users

```bash
cd server
npm run seed
```

The seed script safely creates or refreshes the three demo accounts without removing unrelated users.

### 5. Start the backend

In one terminal:

```bash
cd server
npm run dev
```

The default backend URL is `http://localhost:5000`.

### 6. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

The default frontend URL is `http://localhost:5173`.

## Environment variables

### Server

Create `server/.env` with:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaborative-document-editor
CLIENT_URL=http://localhost:5173
```

| Variable | Purpose |
| --- | --- |
| `PORT` | Express server port |
| `MONGODB_URI` | MongoDB connection URI using `mongodb://` or `mongodb+srv://` |
| `CLIENT_URL` | Allowed frontend origin for CORS |

### Client

Create `client/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the Express API |

Do not commit real secrets or populated `.env` files.

## Demo users

The seed script creates these records. The dashboard always operates as Alice:

| Name | Email |
| --- | --- |
| Alice | `alice@demo.example` |
| Bob | `bob@demo.example` |
| Charlie | `charlie@demo.example` |

Users are created by the seed script. Authentication and account switching are not implemented.

## Supported file types

The import workflow accepts one file of up to 5 MB:

- TXT: converted into editable paragraphs
- MD: converts headings, paragraphs, bold, italic, bullet lists, and ordered lists into Tiptap JSON
- DOCX: extracts text with mammoth and converts it into editable paragraphs

Uploads are processed in memory and are not stored as attachments.

## Sharing behavior

- The owner can read, edit, delete, share, and remove shared access.
- Alice can add or remove seeded users in a document's sharing list.
- Because the application has no authentication or account switching, the current UI cannot open the dashboard as another shared user.

Sharing is performed with the email address of an existing seeded user. The application does not send invitations.

## Design decisions

- **Tiptap JSON persistence:** The editor's structured JSON preserves rich-text nodes and formatting without storing presentation-specific HTML.
- **MongoDB:** Document-shaped storage maps naturally to Tiptap JSON and the application's User and Document models.
- **Embedded sharing references:** Keeping `sharedWith` on each document makes its access relationship explicit and keeps authorization queries straightforward.
- **No real-time collaboration:** Live cursors, presence, and concurrent editing were intentionally excluded because they are outside the assignment scope.

## Known limitations

- The dashboard is a single-user demo operating as seeded Alice; authentication and account switching are not available.
- Autosave does not provide conflict resolution when multiple users edit the same document simultaneously.
- Markdown import supports the implemented heading, paragraph, bold, italic, and list subset rather than the full Markdown specification.
- DOCX import extracts editable text but does not preserve full Word formatting, images, tables, or page layout.
- Imports are limited to one file at a time and 5 MB per file.

## Verification

Run the focused backend integration tests:

```bash
cd server
npm test
```

Build both applications:

```bash
npm run build --prefix server
npm run build --prefix client
```
