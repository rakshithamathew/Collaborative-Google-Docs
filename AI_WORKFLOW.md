# AI-Native Workflow Note

## Tools used

I used OpenAI Codex as an implementation and review partner, alongside the local TypeScript compiler, Vite production build, Node test runner, Supertest, and MongoDB-backed integration tests. Terminal inspection and targeted code searches were used to keep changes grounded in the repository rather than relying on generated assumptions.

## Where AI materially accelerated the work

AI was most useful for rapidly scaffolding the client/server boundary, connecting Tiptap JSON persistence to debounced autosave, and producing focused test cases for document operations, sharing-list changes, and upload rejection. It also shortened review cycles by tracing request validation across routes, controllers, services, and models.

## Output changed or rejected

Generated output was treated as a draft. I narrowed broad suggestions to the assignment scope and rejected optional additions such as real-time presence, comments, version history, registration, refresh tokens, and advanced permissions. I also revised generated implementation details where they were too permissive or risky: seed behavior preserves unrelated records, document IDs and Tiptap content are validated, and uploads use memory storage with a size limit.

## Verification

Correctness and reliability were checked with both TypeScript projects, the frontend production build, and focused backend integration tests. After authentication was removed, the tests were revised to exercise direct dashboard CRUD, owner-managed sharing-list changes, TXT import, and unsupported-file rejection. UX quality was reviewed for loading and empty states, visible autosave status, clear document labels, import errors, sharing errors, back navigation, and responsive layout. Final documentation and claimed behavior were cross-checked against the implemented routes and models.

AI accelerated construction and review, but compiler results, builds, tests, and direct source inspection—not generated text—were used as the acceptance criteria.
