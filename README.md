# LastMinPrep Backend PRD

## 1. Product Overview

LastMinPrep is a preparation and career support platform backend that combines:
- Community-driven Q&A for interview and learning content.
- Job discovery and saving.
- User profiles with progress-oriented identity data.
- Engagement signals (votes, saves, comments, leaderboard).

This document is the maintained Product Requirements Document (PRD) for:
- What is already built and usable now.
- What should be built next, why it matters, and what "done" means.

## 2. Product Goals

### 2.1 Primary Goals
- Help users discover high-quality questions quickly.
- Let users engage through posting, voting, saving, and commenting.
- Support career actions through job listings and saved jobs.
- Provide secure sign-in (email/password and Google OAuth).

### 2.2 Technical Goals
- Stable API-first backend with predictable validation and error shape.
- Production-ready deployment on Render/Railway with Supabase Postgres.
- Observable request/response flow to debug integration issues quickly.

## 3. Users and Key Use Cases

### 3.1 Learner / Candidate
- Signs up, updates profile, browses and searches questions.
- Saves useful questions and jobs.
- Votes and comments in the community.

### 3.2 Contributor / Poster
- Creates and edits questions.
- Posts job listings.
- Manages own content.

### 3.3 Platform Admin / QA (internal)
- Verifies API behavior via Swagger and logs.
- Checks leaderboard and activity metrics.

## 4. Current Feature Set (Implemented)

All routes are under `/api` global prefix.

### 4.1 Authentication

Implemented:
- `POST /api/auth/signup` for local account registration.
- `POST /api/auth/login` for local credential login.
- `GET /api/auth/google` for Google login flow.
- `GET /api/auth/google/signup` for Google signup flow.
- `GET /api/auth/google/callback` for OAuth callback and frontend redirect.

Behavior:
- JWT access token returned after successful auth.
- Google login does not auto-create unknown users.
- Google signup creates user (or links appropriately by provider rules).
- Callback redirects to frontend with either `token` or `error`.

### 4.2 User Profile

Implemented:
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/:id`
- `GET /api/users` (non-production/test use only)

Supported profile fields include:
- Core identity: name, avatar, banner.
- Professional: designation, organisation, highestEducation, experience.
- Personal metadata: age, gender, dob, address, linkedinUrl.
- Skills and progress: techStack, streak, questionsPosted, totalVotes.

### 4.3 Questions Module

Implemented:
- Feed and details: `GET /api/questions`, `GET /api/questions/:id`
- Search: `GET /api/questions/search`
- Personal lists: `GET /api/questions/mine`, `GET /api/questions/saved`
- CRUD: `POST`, `PATCH`, `DELETE /api/questions/:id`
- Engagement: `POST /api/questions/:id/vote`, `POST /api/questions/:id/save`

Notes:
- Optional-auth feed/detail supports richer personalization when JWT is present.
- Vote/save are toggle-based APIs.

### 4.4 Comments Module

Implemented:
- `POST /api/questions/:id/comments`
- `GET /api/questions/:id/comments`
- `DELETE /api/comments/:id`
- `POST /api/comments/:id/react` (like/dislike)

### 4.5 Jobs Module

Implemented:
- Feed/details: `GET /api/jobs`, `GET /api/jobs/:id`
- Saved jobs: `GET /api/jobs/saved`
- CRUD-like actions: `POST /api/jobs`, `DELETE /api/jobs/:id`
- Save toggle: `POST /api/jobs/:id/save`

### 4.6 Leaderboard

Implemented:
- `GET /api/leaderboard` (top users by total votes).

### 4.7 Platform, Security, and Operability

Implemented:
- Global validation with whitelist + forbid unknown fields.
- Helmet security headers.
- CORS setup (dev permissive, prod origin-controlled via env).
- Structured HTTP request/response logging with redaction.
- Global exception filter with consistent error payload.
- Swagger docs at `/api/docs`.
- Supabase-compatible TypeORM runtime and migration setup.
- Redis cache wiring with graceful fallback when Redis is unavailable.

## 5. Functional Requirements (Current)

- Authentication-required routes must reject invalid/missing JWT.
- UUID params are validated server-side.
- URL fields in DTOs support optional/empty use cases where configured.
- Unknown DTO fields are rejected due to strict validation policy.
- OAuth callback URL must exactly match configured Google redirect URI.

## 6. Non-Functional Requirements (Current)

- Security: password hashing (`bcrypt`), token-based auth, redacted logging.
- Reliability: app should boot without Redis hard dependency.
- Deployability: runs on Render/Railway style environments using env vars.
- Observability: request id and structured logs for debugging API flows.

## 7. Roadmap: What We Will Build Next

### Phase 1: Auth and Session Hardening (High Priority)

Build:
- Refresh token flow for both local and Google-auth users.
- Token rotation and logout endpoint(s).
- Optional email verification flow for local signup.

Why:
- Current 15-minute JWT expiry can interrupt user sessions.
- Better session security and UX continuity.

Done when:
- Users remain signed in seamlessly via refresh flow.
- Revoked sessions cannot mint new access tokens.

### Phase 2: Google Auth UX Completion (High Priority)

Build:
- Frontend callback handling for `token` and `error`.
- Explicit UI split: "Continue with Google" (login) vs "Sign up with Google".
- Friendly error mapping for unregistered Google accounts.

Why:
- Backend now enforces login vs signup, frontend must mirror it clearly.

Done when:
- New user can sign up via Google in one click.
- Existing user can login via Google without confusion.

### Phase 3: Content Quality and Moderation (Medium Priority)

Build:
- Reporting endpoints for questions/comments/jobs.
- Soft delete and moderation status fields.
- Basic admin moderation APIs.

Why:
- Community content needs trust and safety controls at scale.

Done when:
- Harmful or spam content can be reported, reviewed, and hidden.

### Phase 4: Personalization and Discovery (Medium Priority)

Build:
- Recommendation ranking using user techStack, saved items, and engagement.
- Better search relevance and filter combinations.
- "Suggested jobs/questions" APIs.

Why:
- Improves retention and content relevance.

Done when:
- Users see visibly more relevant feed results and higher save/conversion.

### Phase 5: Analytics and Product Metrics (Medium Priority)

Build:
- Event logging for login, signup, post, vote, save, comment actions.
- Admin metrics endpoints and dashboard-ready aggregates.

Why:
- Product decisions should be guided by usage patterns.

Done when:
- Team can track activation, retention, and engagement KPIs reliably.

## 8. Open Product Decisions

- Should local and Google accounts with same email always merge automatically?
- Should users be allowed to convert local accounts to Google-linked accounts from profile settings?
- What are moderation roles and permissions in v1 admin panel?
- What are final success KPIs for first public launch?

## 9. Environment and Configuration Baseline

Critical env vars:
- App: `NODE_ENV`, `PORT`, `HOST`, `FRONTEND_URL`
- DB: `DATABASE_URL` or `DB_*`, plus SSL flags when needed
- JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

## 10. Development and Delivery Notes

- API docs: `http://localhost:<PORT>/api/docs`
- Start command (dev): `npm run start:dev`
- Build: `npm run build`
- Migrations: `npm run migration:run` (dev) and `npm run migration:run:prod` (dist)

---

PRD Owner: Backend Team  
Status: Active and maintained in this file  
Last Updated: 2026-04-16
