# LastMinPrep Backend — Product Requirements Document (PRD)

---

## 1. Executive Summary

**LastMinPrep (LMP)** is a community-driven preparation and career support platform. The backend API powers a web application where users can:

- Ask and answer interview/learning questions in a community Q&A format
- Vote, save, and comment on questions to surface the best content
- Discover and post job listings, bookmarking opportunities for later
- Build user profiles with professional metadata, skills, and engagement history
- Follow other users and see a personalized feed of content from their network
- Track top contributors via a leaderboard

The backend is an **API-first NestJS application** built with TypeScript, PostgreSQL, Redis caching, and Cloudinary for media storage. Authentication supports both traditional email/password signups and Google OAuth single sign-on.

**Status**: Active development — all v1 core features are implemented and API-tested via Swagger docs.

---

## 2. Product Vision & Goals

### 2.1 User-Facing (Primary Goals)
| # | Goal | Why It Matters |
|---|---|---|
| G1 | Help users discover high-quality interview & learning questions quickly | Time-to-value is critical for learners cramming last-minute |
| G2 | Enable deep engagement through posting, voting, saving, and commenting | Community content improves with more signals; engagement drives retention |
| G3 | Support career discovery and action through job listings + saved jobs | Users on the platform are preparing → they're also job-hunting |
| G4 | Provide secure, low-friction sign-in (email/password + Google OAuth) | Reduce signup abandonment; Google SSO is the fastest path for many users |
| G5 | Build identity and reputation via profiles, follow graph, and leaderboard | Reputation systems drive high-quality contributions and long-term loyalty |

### 2.2 Technical (Secondary Goals)
| # | Goal | How |
|---|---|---|
| TG1 | Stable, predictable API with consistent validation and error shapes | Global validation pipes + all-exceptions filter + structured HTTP logging |
| TG2 | Production-ready deployment on Render/Railway/Supabase stack | Env-var-driven config, TypeORM migrations, Redis with graceful fallback |
| TG3 | Observable request/response flow for fast debugging | Per-request UUID, structured logs with secret redaction, Swagger playground |
| TG4 | Secure-by-default posture | Helmet headers, CORS origin lock, bcrypt password hashing, JWT auth, strict DTO validation |
| TG5 | Horizontal-readiness via caching | Redis cache layer globally wired (5-min TTL) with no-hard-fail fallback |

---

## 3. Target Users & Personas

### 3.1 Persona: Learner / Candidate (Priya, 24)
- **Role**: Final-year CS student / early-career engineer preparing for interviews
- **Needs**: Find curated interview questions, save the tricky ones, see how others solved similar problems
- **Key Actions**:
  - Signs up with Google in 1 click
  - Browses the question feed → searches for a specific topic (e.g. "dynamic programming")
  - Votes questions up/down based on quality
  - Saves hard questions to a personal list
  - Follows users who consistently post great content
  - Comments to ask for clarification or share an alternative approach
  - Checks saved jobs during job-search sprints
- **Success Metric**: Returns ≥ 3x/week, posts ≥ 1 question or comment within 7 days

### 3.2 Persona: Contributor / Poster (Rohan, 28)
- **Role**: Senior SWE who enjoys giving back to the community; also has hiring needs at his startup
- **Needs**: Share interview experiences, recruit via job posts, build reputation as a helpful expert
- **Key Actions**:
  - Creates well-tagged questions from recent interviews
  - Posts job listings for his company
  - Answers questions via comments
  - Earns votes and climbs the leaderboard
- **Success Metric**: Posts ≥ 2 questions or jobs/month; receives ≥ 10 votes on content

### 3.3 Persona: Platform Admin / QA (Internal Team)
- **Role**: Backend engineer or QA on the product team
- **Needs**: Verify API behavior, debug integration issues, monitor health
- **Key Actions**:
  - Opens `/api/docs` Swagger UI to manually test endpoints
  - Reads structured logs (with request IDs) to trace failing requests
  - Runs database migrations against staging/production
- **Success Metric**: Any API bug can be triaged and root-caused in ≤ 30 minutes using logs + Swagger

---

## 4. Core User Flows (Implemented)

### 4.1 Flow A: Sign Up (Email + Password)
1. User visits signup page → enters name, email, password, (optional: profile details)
2. Frontend calls `POST /api/auth/signup`
3. Backend checks for duplicate email → returns 409 if taken
4. Backend hashes password with bcrypt (12 rounds) → creates user row
5. Backend mints JWT access token (user ID + email in claims)
6. Returns `{ accessToken, user: {...profile...} }` to frontend
7. Frontend stores token in memory/localStorage → redirects to feed

### 4.2 Flow B: Sign Up / Log In (Google OAuth)
**Google Signup flow:**
1. User clicks "Sign up with Google" → `GET /api/auth/google/signup`
2. Backend redirects to Google consent screen (scope: email + profile, state=signup)
3. User grants access → Google redirects to `GET /api/auth/google/callback?code=...`
4. Backend exchanges code for Google profile → checks if Google ID or email exists
   - If new user: creates account (provider=google, no password needed)
   - If existing email with provider≠google: returns 409 conflict (use password login instead)
   - If existing Google user: logs them in
5. Backend mints JWT → redirects to `FRONTEND_URL/auth/google/callback?token=<jwt>`
6. Frontend reads token from URL → user is signed in

**Google Login flow (stricter):**
- Same steps, but state=login. If Google ID is unknown → redirects with `error=Google account not registered` instead of auto-creating account.

### 4.3 Flow C: Browse & Interact With Questions
1. User (signed in or guest) opens feed → `GET /api/questions?page=1&limit=20&sort=hot`
   - If JWT present: feed marks each question with `isVoted/isSaved` personalization
   - If guest: same feed, no personal flags
2. User clicks a question card → `GET /api/questions/:id` → sees full details + comments
3. User wants to search → `GET /api/questions/search?q=recursion`
4. User upvotes → `POST /api/questions/:id/vote` (toggle: sending again removes vote)
5. User saves to bookmarks → `POST /api/questions/:id/save` (toggle)
6. User views personal lists:
   - Saved: `GET /api/questions/saved`
   - Mine (I posted): `GET /api/questions/mine`
   - Following feed: `GET /api/questions/following`

### 4.4 Flow D: Post a New Question
1. Signed-in user clicks "Ask Question" → fills title, selects tech tag, adds hashtags
2. Frontend calls `POST /api/questions` → backend:
   - Validates DTO (strips unknown fields via whitelist + forbidNonWhitelisted)
   - Creates question row with authorId = current user
   - Increments user's `questionsPosted` counter
3. Response includes full question object → appears at top of user's "Mine" list

### 4.5 Flow E: Comment & React
1. On a question page, user types a comment → `POST /api/questions/:id/comments`
2. Backend creates comment (links question + author) → increments question's `commentCount`
3. User sees comment appear. They can:
   - 👍 Like → `POST /api/comments/:id/react { type: 'like' }` (toggle, increments likeCount)
   - 👎 Dislike → `POST /api/comments/:id/react { type: 'dislike' }` (toggle, increments dislikeCount)
4. User can delete their own comment: `DELETE /api/comments/:id` → decrements commentCount
5. Comments sort: `GET /api/questions/:id/comments?sort=top` (by engagement) or `?sort=new` (chronological)

### 4.6 Flow F: Follow Another User
1. User views someone's profile → `GET /api/users/:id`
2. User clicks "Follow" → `POST /api/users/:id/follow`
   - Backend creates unique row in `user_follows` (followerId, followingId) — unique index prevents duplicates
3. Unfollow: `DELETE /api/users/:id/follow`
4. View lists:
   - Who I follow: `GET /api/users/me/following`
   - Who follows me: `GET /api/users/me/followers`
   - Anyone's public lists: `GET /api/users/:id/following` and `/followers`
5. Following feed: `GET /api/questions/following` returns questions posted by users I follow

### 4.7 Flow G: Manage Profile & Upload Media
1. View my profile → `GET /api/users/me`
2. Edit any fields → `PATCH /api/users/me` with UpdateUserDto:
   - name, avatarUrl, bannerUrl, designation, organisation, address, highestEducation, experience, age, gender, dob, linkedinUrl, techStack
3. Upload avatar (separate endpoint):
   - `POST /api/users/me/avatar` with multipart/form-data (field: file, max 5MB)
   - Backend streams image to Cloudinary → applies auto-crop (400×400 face-focused) + quality optimization
   - Returns secure `avatarUrl` → frontend updates profile preview
4. Upload banner: `POST /api/users/me/banner` (same flow, folder: banners)

### 4.8 Flow H: Browse & Post Jobs
1. Browse all jobs → `GET /api/jobs` (optional filters: search, techStack, type, location, experience)
2. View single job → `GET /api/jobs/:id`
3. Post a job (signed in) → `POST /api/jobs` with:
   - title, company, location, type (Remote/Hybrid/Onsite), experience, salary, techStack[], description
4. Save/unsave job → `POST /api/jobs/:id/save` (toggle)
5. View saved jobs → `GET /api/jobs/saved`
6. Delete own job post → `DELETE /api/jobs/:id`

### 4.9 Flow I: View Leaderboard
- `GET /api/leaderboard` → top 50 users ordered by `totalVotes` DESC. Includes profile fields (name, avatar, designation, totalVotes, questionsPosted)

---

## 5. Feature Matrix (Implemented vs Planned)

| Area | Feature | Status | Module |
|---|---|---|---|
| **Auth** | Email/password signup + JWT | ✅ Implemented | auth |
| **Auth** | Email/password login + JWT | ✅ Implemented | auth |
| **Auth** | Google OAuth signup (auto-create account) | ✅ Implemented | auth |
| **Auth** | Google OAuth login (strict, no auto-create) | ✅ Implemented | auth |
| **Auth** | Google callback redirect with token/error | ✅ Implemented | auth |
| **Auth** | Refresh token flow | ❌ Planned (Phase 1) | auth |
| **Auth** | Token rotation + logout endpoints | ❌ Planned (Phase 1) | auth |
| **Auth** | Email verification for local signup | ❌ Planned (Phase 1) | auth |
| **Users** | Get my profile / update my profile | ✅ Implemented | users |
| **Users** | Get any user's public profile | ✅ Implemented | users |
| **Users** | Follow / unfollow users | ✅ Implemented | users |
| **Users** | Follower / following lists (me + any user) | ✅ Implemented | users |
| **Users** | Upload avatar via Cloudinary | ✅ Implemented | users + cloudinary |
| **Users** | Upload banner via Cloudinary | ✅ Implemented | users + cloudinary |
| **Users** | List all users (test only, blocked in prod) | ✅ Implemented | users |
| **Questions** | Paginated feed (optional auth for personal flags) | ✅ Implemented | questions |
| **Questions** | Following feed (only users I follow) | ✅ Implemented | questions |
| **Questions** | Get single question details | ✅ Implemented | questions |
| **Questions** | Search questions by keyword | ✅ Implemented | questions |
| **Questions** | Create / edit / delete question | ✅ Implemented | questions |
| **Questions** | Toggle upvote/downvote | ✅ Implemented | questions |
| **Questions** | Toggle save (bookmark) | ✅ Implemented | questions |
| **Questions** | Saved questions list | ✅ Implemented | questions |
| **Questions** | My posted questions list | ✅ Implemented | questions |
| **Comments** | Add comment to a question | ✅ Implemented | comments |
| **Comments** | List comments (sort: top or new) | ✅ Implemented | comments |
| **Comments** | Delete own comment | ✅ Implemented | comments |
| **Comments** | Like / dislike comment (toggle) | ✅ Implemented | comments |
| **Jobs** | Browse/paginate jobs with filters | ✅ Implemented | jobs |
| **Jobs** | Get single job details | ✅ Implemented | jobs |
| **Jobs** | Post a new job | ✅ Implemented | jobs |
| **Jobs** | Delete own job | ✅ Implemented | jobs |
| **Jobs** | Toggle save job | ✅ Implemented | jobs |
| **Jobs** | Saved jobs list | ✅ Implemented | jobs |
| **Leaderboard** | Top 50 users by totalVotes | ✅ Implemented | leaderboard |
| **Platform** | Global DTO validation (whitelist + forbidUnknown) | ✅ Implemented | main.ts |
| **Platform** | Helmet security headers | ✅ Implemented | main.ts |
| **Platform** | CORS (dev permissive, prod locked to FRONTEND_URL) | ✅ Implemented | main.ts |
| **Platform** | HTTP logging (with request IDs + secret redaction) | ✅ Implemented | main.ts |
| **Platform** | Global exception filter (consistent error payload) | ✅ Implemented | filters/ |
| **Platform** | Swagger API docs at `/api/docs` | ✅ Implemented | main.ts |
| **Platform** | TypeORM + migrations (8 migration files) | ✅ Implemented | database/ |
| **Platform** | Redis cache (global, 5-min TTL, graceful fallback) | ✅ Implemented | app.module.ts |
| **Platform** | Cloudinary image upload/delete service | ✅ Implemented | cloudinary |
| **Platform** | Rate limiting (ThrottlerModule installed) | ⚠️ Partially (module installed, not all guards applied) | — |
| **Content Quality** | Report content endpoints | ❌ Planned (Phase 3) | new module |
| **Content Quality** | Soft delete + moderation status | ❌ Planned (Phase 3) | all content modules |
| **Content Quality** | Admin moderation APIs + roles | ❌ Planned (Phase 3) | new admin module |
| **Personalization** | Smart feed ranking (techStack + engagement signals) | ❌ Planned (Phase 4) | questions |
| **Personalization** | Improved search relevance + combined filters | ❌ Planned (Phase 4) | questions + jobs |
| **Personalization** | Suggested jobs/questions APIs | ❌ Planned (Phase 4) | new endpoints |
| **Analytics** | Event logging (login, post, vote, save, comment) | ❌ Planned (Phase 5) | new analytics module |
| **Analytics** | Admin metrics endpoints + aggregates | ❌ Planned (Phase 5) | new admin module |

---

## 6. API Reference Summary

All routes are under the `/api` global prefix. Auth-required routes need `Authorization: Bearer <jwt>`.

### 6.1 Auth Routes (`/api/auth/*`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | None | Register new user with email/password |
| POST | `/login` | None | Login with email/password → JWT |
| GET | `/google` | None | Redirect to Google OAuth (login mode — no auto-signup) |
| GET | `/google/signup` | None | Redirect to Google OAuth (signup mode — auto-create if new) |
| GET | `/google/callback` | None | Google redirect target → redirects back to frontend with token or error |

### 6.2 User Routes (`/api/users/*`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔐 JWT | List all users (disabled in production — test only) |
| GET | `/me` | 🔐 JWT | Get my full profile |
| PATCH | `/me` | 🔐 JWT | Update my profile fields |
| GET | `/me/following` | 🔐 JWT | Who I follow |
| GET | `/me/followers` | 🔐 JWT | Who follows me |
| POST | `/me/avatar` | 🔐 JWT | Upload avatar image (multipart, 5MB max) |
| POST | `/me/banner` | 🔐 JWT | Upload banner image (multipart, 5MB max) |
| GET | `/:id` | 🔐 JWT | Any user's public profile (UUID validated) |
| GET | `/:id/following` | None | Who user :id follows |
| GET | `/:id/followers` | None | Who follows user :id |
| POST | `/:id/follow` | 🔐 JWT | Follow user :id |
| DELETE | `/:id/follow` | 🔐 JWT | Unfollow user :id |

### 6.3 Question Routes (`/api/questions/*`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Optional JWT | Paginated feed. Query: page, limit, sort (hot/new/votes), search, techTag, authorId. JWT adds isSaved/isVoted flags. |
| GET | `/following` | 🔐 JWT | Feed from users I follow only |
| GET | `/saved` | 🔐 JWT | My saved/bookmarked questions |
| GET | `/mine` | 🔐 JWT | Questions I posted |
| GET | `/search?q=` | None | Keyword search in title + hashtags |
| GET | `/:id` | Optional JWT | Single question + details. JWT adds personal flags. |
| POST | `/` | 🔐 JWT | Create new question (CreateQuestionDto) |
| PATCH | `/:id` | 🔐 JWT | Edit my question (owner-only) |
| DELETE | `/:id` | 🔐 JWT | Delete my question (owner-only) |
| POST | `/:id/vote` | 🔐 JWT | Toggle upvote on question |
| POST | `/:id/save` | 🔐 JWT | Toggle save/bookmark |

### 6.4 Comment Routes (nested + flat)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/questions/:id/comments` | 🔐 JWT | Add comment to question :id |
| GET | `/api/questions/:id/comments` | Optional JWT | List comments for question :id. Query: sort=top\|new |
| DELETE | `/api/comments/:id` | 🔐 JWT | Delete my comment :id (owner-only) |
| POST | `/api/comments/:id/react` | 🔐 JWT | Like or dislike. Body: `{ type: 'like' \| 'dislike' }` (toggle) |

### 6.5 Jobs Routes (`/api/jobs/*`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Optional JWT | Paginated job feed. Query: page, limit, search, techStack, type, location, experience |
| GET | `/saved` | 🔐 JWT | My saved/bookmarked jobs |
| POST | `/` | 🔐 JWT | Post a new job listing |
| GET | `/:id` | Optional JWT | Single job details |
| POST | `/:id/save` | 🔐 JWT | Toggle save job |
| DELETE | `/:id` | 🔐 JWT | Delete my job post (owner-only) |

### 6.6 Leaderboard Routes (`/api/leaderboard/*`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | None | Top 50 users by totalVotes DESC |

### 6.7 Global Behavior
- **Validation**: All DTOs auto-validated. Unknown fields are **rejected** (forbidNonWhitelisted=true).
- **Errors**: Consistent shape: `{ statusCode, message, error?, path, method, timestamp, errorId? }`
- **Request ID**: Each request gets UUID in `x-request-id` response header (or passes through if client sent one).
- **Logging**: All requests logged (non-prod default, prod opt-in via LOG_HTTP=true). Sensitive fields redacted.
- **CORS**: Prod locks to FRONTEND_URL only; dev allows any origin.
- **Rate Limiting**: ThrottlerModule is installed but guards are not yet applied to specific routes.

---

## 7. Database Schema Overview

PostgreSQL database with 9 tables. Migrations are stored in `src/database/migrations/` and applied via TypeORM CLI.

### 7.1 `users` Table
Core identity + extended profile + engagement counters.
- `id` (UUID, PK)
- `email` (string, unique, non-null)
- `passwordHash` (string, nullable — Google users have no password)
- `name` (string, non-null)
- `avatarUrl`, `bannerUrl` (strings, nullable)
- `designation`, `organisation`, `address`, `highestEducation`, `experience` (strings, nullable)
- `age` (smallint, nullable), `gender` (string, nullable), `dob` (date, nullable)
- `linkedinUrl` (string, nullable)
- `techStack` (text[] array, default: `[]`)
- `streak` (int, default: 0) — consecutive days active (TBD: logic to increment)
- `lastActive` (date, nullable)
- `questionsPosted` (int, default: 0) — incremented on question create
- `totalVotes` (int, default: 0) — aggregate votes on user's content (leaderboard metric)
- `googleId` (string, unique, nullable)
- `provider` (string, default: 'local') — 'local' or 'google'
- `isVerified` (boolean, default: false) — email verified flag (TBD: verification flow)
- `createdAt`, `updatedAt` (timestamps)

### 7.2 `questions` Table
Community Q&A posts.
- `id` (UUID, PK)
- `title` (text, non-null) — the question text
- `tech_tag` (string, non-null) — primary category (e.g. "JavaScript", "System Design")
- `hashtags` (text[] array, default: `[]`) — additional tags
- `author_id` (UUID, FK → users.id) — poster
- `vote_count` (int, default: 0) — net upvotes
- `comment_count` (int, default: 0) — total comments
- `is_hot` (boolean, default: false) — algorithmically curated "hot" flag
- `created_at`, `updated_at` (timestamps)

### 7.3 `votes` Table
Per-user vote tracking on questions (enforces 1 vote/user/question → toggle semantics).
Not explicitly read but implied by service layer.

### 7.4 `saved_questions` Table
User bookmark join.
- Unique (user_id, question_id) → POST toggle saves/unsaves.

### 7.5 `comments` Table
Threaded discussion on questions.
- `id` (UUID, PK)
- `question_id` (UUID, FK → questions.id, ON DELETE CASCADE)
- `author_id` (UUID, FK → users.id, ON DELETE CASCADE)
- `text` (text, non-null) — comment body
- `like_count` (int, default: 0)
- `dislike_count` (int, default: 0)
- `created_at` (timestamp)

### 7.6 `comment_reactions` Table
Per-user per-comment reaction tracking (enforces 1 reaction type/user/comment).

### 7.7 `jobs` Table
Job listings.
- `id` (UUID, PK)
- `title` (string, non-null) — e.g. "Senior Backend Engineer"
- `company` (string, non-null)
- `location` (string, nullable) — e.g. "Bengaluru, India"
- `type` (varchar(10), nullable) — enforced values: 'Remote' | 'Hybrid' | 'Onsite'
- `experience` (string, nullable) — e.g. "3-5 years"
- `salary` (string, nullable) — e.g. "25-35 LPA"
- `techStack` (text[] array, default: `[]`)
- `description` (text, nullable)
- `posted_by` (UUID, FK → users.id, ON DELETE CASCADE)
- `created_at` (timestamp)

### 7.8 `saved_jobs` Table
User bookmark join.
- Unique (user_id, job_id) → toggle save.

### 7.9 `user_follows` Table
Social graph.
- `id` (UUID, PK)
- `followerId` (UUID, FK → users.id, ON DELETE CASCADE)
- `followingId` (UUID, FK → users.id, ON DELETE CASCADE)
- **Unique index** on (followerId, followingId) → prevents duplicate follows
- `createdAt` (timestamp)

---

## 8. Non-Functional Requirements

### 8.1 Security
| Requirement | Implementation |
|---|---|
| Password storage | bcrypt with 12 rounds of hashing. Plaintext never persisted or logged. |
| Transport auth | JWT tokens with ConfigModule-provided secret. Claims: sub (user id) + email. |
| Input validation | Global ValidationPipe with `whitelist: true` + `forbidNonWhitelisted: true`. Unknown DTO fields rejected. |
| UUID param validation | All `/:id` routes use `ParseUUIDPipe` → malformed IDs return 400. |
| Secret redaction | HTTP logger automatically redacts: password, passwordHash, accessToken, refreshToken, authorization, cookie. Never logged plaintext. |
| Security headers | Helmet applied globally → sets X-Content-Type-Options, X-Frame-Options, HSTS, etc. |
| CORS policy | Production: origins strictly limited to FRONTEND_URL. Dev: permissive for local Angular. |
| OAuth security | Google callback error handling prevents silent failures; unknown Google IDs rejected in login mode. |

### 8.2 Performance
| Requirement | Implementation |
|---|---|
| Read scaling | Redis cache wired globally (TTL 300s). Uses `cache-manager-ioredis-yet` + lazy connect. |
| Cache resilience | If Redis unreachable (host missing / connect fails), module gracefully falls back to no-op in-memory default. App still boots. |
| Pagination | All list endpoints (questions, jobs, comments) accept `page` + `limit` query params to prevent oversized responses. |

### 8.3 Availability
| Requirement | Implementation |
|---|---|
| No hard Redis dependency | Redis failures caught → cache disabled, app continues serving all endpoints. |
| Proxy trust | `trust proxy = 1` set → works behind Render/Railway reverse proxies (correct client IP via x-forwarded-for). |
| Database SSL | Configurable via `DB_SSL` / `DB_SSL_REJECT_UNAUTHORIZED` or embedded in DATABASE_URL (`?sslmode=require`). Required for Supabase/Render Postgres. |

### 8.4 Deployability
- **12-factor style**: All config via env vars. No hardcoded URLs, secrets, or ports.
- **Build output**: Standard NestJS build → `dist/` directory.
- **Migrations**: Production command `npm run migration:run:prod` runs TypeORM migrations against dist before `start:prod`.
- **Render-ready script**: `npm run start:render` = run migrations + start server.
- **Node version engine**: `>=20 <23` enforced in package.json.

### 8.5 Observability
| Signal | Implementation |
|---|---|
| Request tracing | UUID per request in `x-request-id` header. Passes through if client-provided. |
| Access logs | Method, URL, IP, origin, status, latency, sanitized body. Enabled by default in non-prod, opt-in via `LOG_HTTP=true` in prod. |
| Error logs | Unhandled exceptions logged with unique `errorId` UUID → stack trace included only in non-prod responses. |
| API docs | Interactive Swagger UI at `/api/docs` with Bearer auth support. |

---

## 9. Environment & Configuration

All configuration loaded from `process.env` via `ConfigModule` (see [configuration.ts](file:///Users/arpitasahoo/Documents/lmp-backend/lmp-backend/src/config/configuration.ts)).

### 9.1 Required Environment Variables

| Category | Variable | Default | Description |
|---|---|---|---|
| **App** | `NODE_ENV` | `'development'` | Set to `'production'` for prod (enables strict CORS, disables stack traces in errors) |
| **App** | `PORT` | `3333` | HTTP port |
| **App** | `HOST` | `'0.0.0.0'` | Bind address |
| **App** | `FRONTEND_URL` | — | Required in prod: origin allowed for CORS + Google OAuth redirect base |
| **App** | `LOG_HTTP` | — | Set to `'true'` to force HTTP logging in prod |
| **Database** (option 1: URL) | `DATABASE_URL` | — | Postgres connection string (e.g. `postgres://user:pass@host:5432/db?sslmode=require`). Takes priority. |
| **Database** (option 2: parts) | `DB_HOST` | — | Postgres host |
| | `DB_PORT` | `5432` | Postgres port |
| | `DB_USERNAME` | — | Postgres user |
| | `DB_PASSWORD` | — | Postgres password |
| | `DB_NAME` | — | Postgres database name |
| **Database SSL** | `DB_SSL` | `'false'` | Set to `'true'` to enable SSL (also auto-enabled if DATABASE_URL contains `sslmode=require`) |
| | `DB_SSL_REJECT_UNAUTHORIZED` | `'false'` | Set to `'true'` to strictly validate server certs |
| **JWT** | `JWT_SECRET` | — | **REQUIRED** — key for signing access tokens |
| | `JWT_EXPIRES_IN` | — | e.g. `'15m'` |
| | `REFRESH_TOKEN_SECRET` | — | Reserved for Phase 1 refresh token flow |
| | `REFRESH_TOKEN_EXPIRES_IN` | — | Reserved for Phase 1 |
| **Google OAuth** | `GOOGLE_CLIENT_ID` | — | Google Cloud OAuth client ID |
| | `GOOGLE_CLIENT_SECRET` | — | Google Cloud OAuth client secret |
| | `GOOGLE_CALLBACK_URL` | — | Full callback URL (must match Google Console, e.g. `https://api.lastminprep.com/api/auth/google/callback`) |
| **Redis (optional)** | `REDIS_HOST` | — | If missing, cache is disabled (no failure) |
| | `REDIS_PORT` | `6379` | |
| | `REDIS_PASSWORD` | — | |
| **Cloudinary** | `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` | — | Required for avatar/banner uploads to work |

---

## 10. Roadmap & Priorities

### Phase 1: Auth and Session Hardening (High Priority)

**Build:**
1. **Refresh token flow** — Both local and Google-auth users get long-lived refresh tokens (e.g. 7 days) stored server-side (hash) + short access tokens (15 min). Endpoint: `POST /api/auth/refresh`.
2. **Token rotation + logout** — On refresh: old refresh token invalidated. Endpoints: `POST /api/auth/logout` (single session), `POST /api/auth/logout-all` (all sessions).
3. **Optional email verification for local signup** — Send verification link (JWT-signed) with expiry. New users see banner until verified; optional gated access to posting features.

**Why:**
- Current 15-minute JWT expiry will interrupt user sessions; refresh flow enables seamless continuity.
- Without logout, lost devices / shared computers have no revocation path.
- Email verification protects against signup spam and builds trust for job posters.

**Done When:**
- A user can close the app for 3 days, reopen, and be auto-logged-in via refresh flow.
- Revoked refresh tokens cannot mint new access tokens.
- Local-signup users receive an email verification link and can confirm their email.

### Phase 2: Google Auth UX Completion (High Priority)

**Build:**
1. **Frontend callback handler** — The `/auth/google/callback?token=...` and `?error=...` routes in the Angular frontend must handle redirects correctly:
   - On `token`: store, redirect to feed, show welcome toast
   - On `error`: show friendly localized message, offer "Try signing up instead" or "Use email login" CTAs
2. **Explicit UI split** — Two clearly separate buttons: "Continue with Google" (hits `/api/auth/google` → login mode, no auto-create) vs "Sign up with Google" (hits `/api/auth/google/signup` → creates account if new)

**Why:**
- Backend now strictly enforces login vs signup semantics. Frontend must present this to avoid user confusion (person clicks login, gets "not registered" error with no path forward).

**Done When:**
- A brand-new user can sign up with Google, end-to-end, in ≤ 3 clicks, with zero error screens.
- An existing Google user can click login and land on the feed.
- A user with an email-password account who clicks "Continue with Google" gets a clear error with a "Login with password" link.

### Phase 3: Content Quality and Moderation (Medium Priority)

**Build:**
1. **Report endpoints** — `POST /api/questions/:id/report`, `POST /api/comments/:id/report`, `POST /api/jobs/:id/report`. Body: `{ reason: string, details?: string }`. Stores in `reports` table (status: open/resolved/rejected).
2. **Soft delete + moderation status fields** — Add `deletedAt` (nullable timestamp) + `status` (draft/published/removed) to questions, comments, jobs. Soft-deleted content hidden from feeds but queryable by moderators.
3. **Basic admin moderation APIs** — `GET /api/admin/reports` (paged, filtered), `POST /api/admin/reports/:id/resolve { action: 'remove' | 'keep' }`. Gate with admin role check (new `users.role` column: 'user' | 'admin').

**Why:**
- As community grows, bad actors will post spam, abuse, or poorly-tagged content. Without reporting + moderation, trust erodes.

**Done When:**
- Any user can report any question/comment/job in 2 clicks.
- An admin can review all open reports, see the offending content, and either remove it or dismiss the report, all via API.
- Removed content is invisible to normal users (soft-deleted, still in DB for audit).

### Phase 4: Personalization and Discovery (Medium Priority)

**Build:**
1. **Smart feed ranking** — Replace current simple sort (hot/new/votes) with a weighted score using: `vote_count * 3 + comment_count * 2 + is_following_author * 10 + matches_techStack * 5 - age_decay`. JWT-required route personalizes per user.
2. **Improved search + filters** — Combined filters on questions: `techTag + minVotes + hashtag + dateRange`. Jobs: `type + experience + salaryRange + location`. Use trigram / full-text search (Postgres `pg_trgm`) for relevance over `ILIKE`.
3. **"Suggested" APIs** — `GET /api/questions/suggested` (based on techStack + saved questions patterns), `GET /api/jobs/suggested` (matches user techStack + location).

**Why:**
- Flat feeds work for 100 questions; they fail for 10,000. Personalized ranking drives retention via "I can't stop scrolling" and saves users from hunting.

**Done When:**
- A user with techStack=['React', 'TypeScript'] sees ≥ 70% React/TS questions in their suggested feed.
- A user who saves 5 system-design questions gets system-design-heavy suggestions.
- Team can A/B test ranking weights via feature flags (configurable via env vars initially).

### Phase 5: Analytics and Product Metrics (Medium Priority)

**Build:**
1. **Event logging** — Structured events (write to new `events` table or emit to log forwarder) for:
   - `signup` (provider: local/google)
   - `login` (provider, success/fail)
   - `question:create`, `question:vote`, `question:save`, `question:view`
   - `comment:create`, `comment:react`
   - `job:create`, `job:save`, `job:view`
   - `follow:create`
2. **Admin metrics endpoints** — `GET /api/admin/metrics/daily` (DAU, posts, votes, comments, signups by day), `GET /api/admin/metrics/engagement` (top questions, top users, retention cohorts). Dashboard-ready JSON (Chart.js-friendly shapes).

**Why:**
- Product decisions without data are guesses. We need to know if the leaderboard drives posts, if Google signup wins users, if users who save questions return more.

**Done When:**
- PM can open a dashboard (or read API JSON) and see last-30-day activation funnel, retention curves, and top content.
- Every feature launch (e.g. follow system) can be measured for usage within 48 hours.

---

## 11. Open Product Decisions

| # | Decision | Context | Options to Consider |
|---|---|---|---|
| OD-1 | Should local and Google accounts with the same email merge automatically? | Current behavior: if user signed up with email/password (provider=local) and later clicks Google signup with same email → returns 409 Conflict, asks user to use password login. | a) Keep current (safe: no surprise merging), b) Auto-merge if user clicks Google (convenient but risk: account takeover via Google-side email changes), c) Require explicit confirmation flow |
| OD-2 | Can users convert local accounts → Google-linked from profile settings? | Currently no way to link a Google ID to an existing local account. Users must create a new account. | a) Add "Link Google" in profile settings, b) Allow password-to-Google migration, c) Defer until Phase 2+ |
| OD-3 | What are the moderation roles/permissions in v1 admin panel? | Currently no admin roles at all. Phase 3 needs at minimum a global 'admin' role. | a) Binary: user vs admin (simplest), b) Hierarchy: superadmin → mod → trusted user → user, c) RBAC with scopes (e.g. can_remove_content, can_view_metrics) |
| OD-4 | What are the first-launch success KPIs? | No agreed-upon target numbers yet. | Suggested starting points: 500 signups in month 1, 30% 7-day retention, 100 questions posted, 10 jobs posted. Adjust after launch. |
| OD-5 | Hot question algorithm owner & tuning | `is_hot` column exists but there's no documented service that populates it. | a) CRON job to compute hourly, b) Compute on-the-fly via ranking formula, c) Admin-curated only |

---

## 12. Proposed Success KPIs (First Public Launch)

Tracked via Phase 5 analytics unless otherwise noted.

| Category | Metric | Target | How Measured |
|---|---|---|---|
| **Acquisition** | Total signups (30 days) | 500 | Events + users.createdAt |
| **Acquisition** | Google signup % of total | ≥ 60% | Events.signup.provider |
| **Activation** | Users who post ≥ 1 question or comment | ≥ 20% of signups | engagement events |
| **Activation** | Users who save ≥ 3 items (questions + jobs) | ≥ 15% of signups | save events |
| **Retention** | Day-7 retention (signed up, came back) | 30% | login events vs signup cohort |
| **Retention** | Day-30 retention | 10% | login events vs signup cohort |
| **Content** | Total questions posted | 100 | questions.createdAt |
| **Content** | Total jobs posted | 10 | jobs.createdAt |
| **Engagement** | Votes per question (avg) | ≥ 3 | votes / questions count |
| **Engagement** | Follow graph size (total follows) | 200 edges | user_follows count |
| **Technical** | API P95 response time | < 400ms | access log aggregator |
| **Technical** | Uptime | 99.5% | monitoring platform |

---

## Appendix A: Quick Developer Reference

### A.1 Useful Commands
```bash
# Install
npm install

# Dev (with watch)
npm run start:dev

# Build + prod
npm run build
npm run start:prod

# Migrations
npm run migration:generate -- src/database/migrations/MyChange
npm run migration:run
npm run migration:revert

# Tests
npm run test           # unit
npm run test:e2e       # e2e
npm run test:cov       # coverage

# Lint/Format
npm run lint
npm run format
```

### A.2 API Docs URL
- Dev: `http://localhost:3333/api/docs`
- Prod: `https://<your-host>/api/docs`
- Click "Authorize" → enter `Bearer <jwt>` to test authenticated endpoints.

### A.3 Module Map
```
src/
├── auth/                      Signup, login, Google OAuth, JWT strategies
│   ├── dto/                   SignupDto, LoginDto
│   └── strategies/            google.strategy.ts, jwt.strategy.ts
├── users/                     Profile, follow graph, avatar/banner uploads
│   ├── dto/                   UpdateUserDto
│   └── entities/              user.entity.ts, user-follow.entity.ts
├── questions/                 Q&A feed, CRUD, votes, saves, search
│   ├── dto/                   CreateQuestionDto, QuestionsQueryDto
│   └── entities/              question.entity.ts, vote.entity.ts, saved-question.entity.ts
├── comments/                  Comments + reactions
│   ├── dto/                   CreateCommentDto, ReactCommentDto
│   └── entities/              comment.entity.ts, comment.reaction.entity.ts
├── jobs/                      Job board CRUD + saves
│   ├── dto/                   CreateJobDto, JobsQueryDto
│   └── entities/              job.entity.ts, saved-job.entity.ts
├── leaderboard/               Top users leaderboard
├── cloudinary/                Image upload service
├── config/                    configuration.ts (env → typed config)
├── database/                  data-source.ts + migrations/
├── filters/                   all-exceptions.filter.ts
├── app.module.ts              Root module: wires DB, Redis, all feature modules
└── main.ts                    Bootstrap: pipes, interceptors, filters, CORS, helmet, swagger
```

---

*PRD Owner: Backend Team*
*Status: Active and maintained*
*Last Updated: 2026-07-27*
