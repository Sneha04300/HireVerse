# Chapter 5 — System Design & Methodology

## HireVerse: AI-Powered Placement Preparation Platform

---

## 5.1 Introduction

HireVerse is a full-stack, AI-powered placement-preparation platform built to help undergraduate computer-science students systematically prepare for software engineering internships and placements. The platform integrates a set of tools that are normally scattered across multiple websites — resume parsing and ATS scoring, DSA practice tracking, AI-driven mock interviews with voice input/output, career roadmap generation, and a personal placement mentor chat — into a single unified dashboard.

The project follows the classic **three-tier client–server architecture**:

1. **Presentation Tier (Frontend)** — a React 18 single-page application built with Vite and styled with Tailwind CSS.
2. **Application Tier (Backend)** — a Node.js/Express REST API that enforces business rules, authenticates users with JWT, and orchestrates a set of AI and analytics services.
3. **Data Tier (Persistence)** — a MongoDB (Mongoose ODM) document database, plus the local filesystem for uploaded resumes, generated documents, and synthesized audio.

The system makes deliberate use of AI in three places:

- **Groq** (hosted LLM + Whisper) for resume analysis, job-description matching, resume rewriting, interview question generation, answer evaluation, final interview reports, DSA coaching insights, and the placement-mentor chat.
- **Piper** (local neural TTS) for converting interview questions into natural speech.
- **Groq Whisper** for transcribing the candidate's recorded voice answers.

Every claim in this chapter is based on the actual implemented source code in the repository. Where a feature is stubbed, mocked, or partially implemented, that fact is stated explicitly so the reader is never misled.

---

## 5.2 System Architecture

### 5.2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                         │
│  Vite dev server (port 5173) · React 18 · Tailwind CSS · Axios      │
│                                                                     │
│  AuthContext / ThemeContext            Pages (7)                     │
│  services/api.js  (Axios, JWT interceptor)                          │
│  Pages: Login · Signup · Dashboard · Resume Analyzer ·              │
│         DSA Tracker · AI Mock Interview · Career Copilot            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTP + JSON  (JWT Bearer token)
                                │ baseURL http://localhost:3001/api
┌───────────────────────────────▼─────────────────────────────────────┐
│                        BACKEND (Express API)                        │
│  server.js  →  connectDB()  →  mount 13 route groups                │
│                                                                     │
│  Middleware: cors · express.json · JWT protect · global errorHandler│
│  Static: /uploads · /generated-resumes · /audio                     │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────┐    │
│  │ Controllers │→ │  Services   │→ │  Prompts    │  │  Models     │    │
│  │ (17 files)  │  │ (15 files)  │  │ (5 files)   │  │ (15 files)  │    │
│  └────────────┘  └─────┬──────┘  └────────────┘  └──────┬──────┘    │
│                        │                                 │           │
│        ┌───────────────┼───────────────┐                │           │
│        ▼               ▼               ▼                ▼           │
│   Groq LLM/Whisper  Piper (local TTS)  MongoDB        File system   │
│   (llama-3.3-70b,   (PIPER_PATH exe)   (Mongoose)    uploads/      │
│    whisper-large)                                        generated-resumes/
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2.2 Request Flow (Example: Resume Analysis)

1. The user selects a PDF/DOCX resume in the `ResumeAnalyzerPage`.
2. `axios` (configured in `frontend/src/services/api.js`) attaches the JWT as a `Bearer` token and POSTs `multipart/form-data` to `/api/resume/analyze`.
3. `resumeRoutes` wraps the route with `protect` (JWT verification) and `multerUpload("resume")` (file validation, 5 MB limit, PDF/DOCX only).
4. `resumeController.analyzeResume` persists a `ResumeAnalysis` document in state `pending`, then delegates to `resumeService.analyzeResumeWithAI`.
5. The service extracts text (`pdf-parse` for PDF, XML regex for DOCX), builds a prompt via `resumeAnalysisPrompt`, calls Groq (`llama-3.3-70b-versatile`) for structured extraction, then computes deterministic scores with `resumeScoringService`.
6. If the Groq call fails, `resumeFallbackParser` (regex) extracts data and the same scoring engine runs, so analysis never hard-fails.
7. Results are persisted back to the `ResumeAnalysis` document (`status: "analyzed"`) and returned to the frontend, which renders the ATS score, section breakdown, strengths/weaknesses, missing keywords, and suggestions.

### 5.2.3 Layered Pattern

The backend is strictly layered:

- **`routes/`** — declare endpoints, apply middleware (auth, upload), delegate to a single controller function. No business logic.
- **`controllers/`** — validate HTTP input, coordinate services/models, and shape HTTP responses. No AI logic.
- **`services/`** — encapsulate business rules and AI orchestration (text extraction, scoring, LLM calls, analytics).
- **`prompts/`** — pure functions that build `{ system, user }` prompt pairs; kept separate so prompts are versionable.
- **`models/`** — Mongoose schemas; the single source of truth for data shapes and enums.
- **`config/`, `middleware/`, `utils/`** — infrastructure (DB connection, multer, JWT protect, global error handler, token generator).

This separation was the main factor that kept the codebase maintainable as AI features were added incrementally.

---

## 5.3 Technology Stack

### 5.3.1 Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js / Express | Express ^4.19 | REST API server, routing, middleware |
| MongoDB / Mongoose | ^8.24 | Document database + ODM schemas |
| bcryptjs | ^2.4 | Password hashing (`saltRounds = 10`) |
| jsonwebtoken | ^9.0 | JWT creation + verification (30-day expiry) |
| multer | ^1.4.5-lts.1 | Multipart file uploads (resumes, audio) |
| pdf-parse | ^1.1.4 | PDF text extraction |
| docx | ^9.7 | Programmatic DOCX generation (resume rewrite) |
| pdfkit | ^0.19 | Programmatic PDF generation (resume rewrite) |
| groq-sdk | ^1.3 | Groq LLM (`llama-3.3-70b-versatile`) + Whisper (`whisper-large-v3-turbo`) |
| openai | ^6.48 | Installed dependency (not actively used in current code paths) |
| cors | ^2.8 | Cross-origin resource sharing (configurable via `CLIENT_URL`) |
| dotenv | ^16.6 | Environment variable loading |
| nodemon | ^3.1 (dev) | Auto-restart during development |

### 5.3.2 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^18.2 | UI library |
| Vite | ^5.2 | Build tool + dev server (port 5173) |
| Tailwind CSS | ^3.4 | Utility-first styling, `darkMode: "class"` |
| react-router-dom | ^6.22 | Client-side routing |
| axios | ^1.18 | HTTP client with interceptors |
| ESLint (+ React plugins) | ^8.57 | Linting (run as `npm run lint`) |

### 5.3.3 AI / Voice Services

| Service | Model / Tool | Used For |
|---|---|---|
| Groq Chat Completions | `llama-3.3-70b-versatile` | Resume analysis, JD matching, resume rewrite, interview questions, answer evaluation, final reports, DSA coach, placement-mentor chat |
| Groq Audio Transcriptions | `whisper-large-v3-turbo` | Speech-to-text for recorded answers |
| Piper TTS (local) | `PIPER_PATH` executable + `PIPER_MODEL` voice file | Text-to-speech for interview questions (`.wav` in `public/audio/`) |
| LeetCode GraphQL API | `https://leetcode.com/graphql` | Live fetch of a user's LeetCode profile, contest history, and submission heatmap (12-hour cache) |

### 5.3.4 Environment Variables

Defined in `backend/.env` (template in `.env.example`):

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hireverse
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Additional variables used by code (documented in `readme.md` and checked in services):

```
GROQ_API_KEY=your_groq_api_key
PIPER_PATH=your_piper_executable
PIPER_MODEL=your_voice_model
```

> **Note on port configuration:** `server.js` defaults to `PORT = process.env.PORT || 5000`, but the frontend Axios instance points to `http://localhost:3001/api`. In practice the development `.env` must set `PORT=3001` (as the project `readme.md` instructs) for the two tiers to talk to each other. This is a minor configuration inconsistency between the default value and the README instructions.

---

## 5.4 Database Design

MongoDB is used because the domain is highly heterogeneous (every feature stores a different shape of document) and the read/write patterns are document-oriented. The database contains 15 Mongoose collections (models). All user-owned documents reference `User._id`.

### 5.4.1 Entity Relationship Overview

```
User (auth, xp, level)
 ├── Profile             1:1  (college, skills, target company/role)
 ├── ResumeAnalysis     1:N  (each upload → ATS score, sections, extracted data)
 ├── ATSReport          1:N  (legacy report docs)
 ├── DSAProgress        1:N  (each logged problem)
 ├── DSAInsight         1:1  (AI coach output, cached 24h)
 ├── LeetCodeProfile    1:1  (live LeetCode snapshot, cached 12h)
 ├── GithubReport       1:N  (mock report)
 ├── LeetcodeReport     1:N  (mock report)
 ├── MockInterview      1:N  (each interview with questions/transcript/report)
 ├── CareerCopilot      1:1  (chat history, readiness, focus areas, plan)
 ├── Roadmap            1:1  (target role + monthly phases)
 ├── WeeklyPlan         1:1  (Mon–Sun tasks + progress)
 ├── Internship         1:N  (job applications with status)
 └── Resume             (legacy/basic model, superseded by ResumeAnalysis)
```

### 5.4.2 Schema Details

**User (`user.js`)** — `name`, `email` (unique), `password` (bcrypt-hashed), `xp`, `level`, `badges`, `streak`, `lastActiveDate`, timestamps.

**Profile (`Profile.js`)** — `userId` (ref User), `college`, `branch`, `graduationYear`, `cgpa`, `skills[]`, `github`, `leetcode`, `linkedin`, `targetCompany`, `targetRole`.

**ResumeAnalysis (`ResumeAnalysis.js`)** — the primary resume document:
- `userId`, `fileName`, `fileUrl`, `fileSize`, `mimeType`
- `atsScore` (0–100), `sectionScores` sub-document (`formatting`, `keywords`, `experience`, `skills`, `projects`, `education`)
- `strengths[]`, `weaknesses[]`, `suggestions[]`, `missingKeywords[]`
- `extractedData` sub-document (`name`, `email`, `phone`, `linkedin`, `github`, `skills[]`, `education[]`, `experience[]`, `projects[]`, `certifications[]`)
- `status` enum `[pending, analyzed, failed]`, `errorMessage`
- Compound index `{ userId: 1, createdAt: -1 }` for the history query.

**MockInterview (`MockInterview.js`)** — the richest schema:
- `type` enum `[Technical, HR, Mixed]`, `difficulty` enum `[Easy, Medium, Hard]`
- `status` enum `[started, in_progress, completed, abandoned]`
- `startedAt`, `endedAt`, `duration` (seconds), `currentQuestionIndex`
- `questions[]`: `number`, `question`, `answer`, `score`, `evaluation` (5 dimension scores + strengths/weaknesses/feedback/idealAnswer), `source`, `generatedBy` enum `[GPT, static, groq-llama, groq-whisper]`, `createdAt`
- `transcript[]`: `speaker` enum `[AI, User]`, `text`, `timestamp`
- `report`: `overallScore`, `communication`, `technicalKnowledge`, `confidence`, `problemSolving`, `strengths[]`, `weaknesses[]`, `recommendations[]`, `summary`, `hiringDecision`, `difficultyLevel`
- Static enums exposed as `INTERVIEW_TYPES`, `DIFFICULTY_LEVELS`, `VERDICTS`.

**CareerCopilot (`CareerCopilot.js`)** — one document per user (`userId` unique):
- `chatHistory[]`: `role` enum `[user, assistant]`, `message`, `timestamp`
- `readiness`: `overallScore`, `companyTarget`, `estimatedMonths`
- `focusAreas[]`: `name`, `progress`
- `weeklyGoals[]`: `title`, `completed`
- `insights[]` (strings)
- `actionPlan[]`: `week`, `title`, `description`, `status` enum `[done, current, upcoming]`

**DSAProgress (`DSAProgress.js`)** — one document per logged problem:
- `title` (required), `platform` enum `[LeetCode, GFG, CodeStudio, HackerRank, Other]`, `problemUrl`
- `difficulty` enum `[Easy, Medium, Hard]` (required), `topic[]`, `companies[]`
- `status` enum `[Solved, Attempted, Revising]`, `timeTaken`, `attempts`, `notes`, `bookmarked`, `revisionCount`, `solvedAt`
- Indexes: `{ userId, title }`, `{ userId, status }`, `{ userId, difficulty }`.

**DSAInsight (`DSAInsight.js`)** — `userId` (unique), `summary`, `strengths[]`, `weaknesses[]`, `recommendations[]` (`title/reason/impact/priority`), `weeklyPlan[]` (`day/task`), `estimatedReadinessIncrease`, `interviewPrediction`, `motivationalTip`, `generatedAt`.

**LeetCodeProfile (`LeetCodeProfile.js`)** — `userId` (unique), `username`, `avatar`, `problemsSolved`, `easySolved/mediumSolved/hardSolved`, `totalEasy/totalMedium/totalHard`, `acceptanceRate`, `ranking`, `contestRating`, `attendedContestsCount`, `badges[]`, `submissionHeatmap` (array of `[timestamp, count]`), `recentContests[]`, `lastSync`.

**Legacy / simpler collections** — `Resume`, `ATSReport` (`score`, `strengths[]`, `weaknesses[]`), `GithubReport` (`repositories`, `commits`, `stars`, `githubScore`, `skills[]`, strengths/weaknesses), `LeetcodeReport` (`solved/easy/medium/hard`, `contestRating`, `strongTopics[]`, `weakTopics[]`, `topicStrength`), `Roadmap` (`targetRole`, `currentSkills[]`, `roadmap[]` with `month/phase/topics`), `WeeklyPlan` (`progress`, `tasks[]` with `day/task/category/completed`), `Internship` (`company`, `role`, `date`, `status` enum `[Applied, OA, Interview, Rejected, Selected]`).

### 5.4.3 Indexing Strategy

Indexes are placed on the fields most used in queries: `userId` on every user-owned collection, plus compound indexes for resume history (`userId, createdAt`) and DSA filter queries (`userId` + `title`/`status`/`difficulty`). `userId` is marked unique on the 1:1 collections (`CareerCopilot`, `DSAInsight`, `LeetCodeProfile`).

---

## 5.5 Module-wise Implementation

Each module below describes: purpose, backend flow (controller → service → model), API endpoints, frontend page/components, and the key logic implemented.

### 5.5.1 Authentication Module

- **Purpose:** register/login users and protect all other modules with JWT.
- **Backend:**
  - `authController.registerUser` — validates duplicate email, hashes password with `bcrypt.hash(password, 10)`, creates `User`, returns `{ token, user }`.
  - `authController.loginUser` — finds user by email, verifies password with `bcrypt.compare`, issues a JWT via `generateToken` (30-day expiry), returns `{ token, user }`.
  - `authController.getProfile` — returns the authenticated user.
  - `authMiddleware.protect` — extracts the token from the `Authorization: Bearer` header or a cookie, verifies with `jwt.verify`, and attaches `req.user`.
- **Endpoints:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`.
- **Frontend:** `Login.jsx`/`Signup.jsx` wrap `SigninForm`/`SignupForm` in `AuthLayout`. `AuthContext` persists `token` + `user` in `localStorage`; `api.js` adds the token to every request and redirects to `/login` on an invalid/expired token.
- **XP / Leveling:** `userController.addXP` adds XP and recomputes `level = Math.floor(xp / 100) + 1` (`POST /api/users/add-xp`).

### 5.5.2 Profile Module

- **Purpose:** store the student's academic background and target-company metadata used by AI features.
- **Endpoints:** `POST /api/profile` (create), `GET /api/profile/:userId` (fetch).
- **Frontend:** `profileServices.getProfile(userId)` exists; the profile is not yet surfaced through a dedicated page (placeholder pages exist for this).

### 5.5.3 Resume Analyzer Module

This is the most complete AI module.

- **Backend flow:**
  1. `resumeController.uploadResume` — stores the file, creates a `ResumeAnalysis` document (`status: "pending"`). (`POST /api/resume/upload`)
  2. `resumeController.analyzeResume` — accepts either a fresh multipart upload (Case A) or a `resumeId` (Case B), then runs `resumeService.analyzeResumeWithAI`. (`POST /api/resume/analyze`)
  3. `resumeService.analyzeResumeWithAI`:
     - Extracts text via `extractText` (`pdf-parse` for PDF; regex over `<w:t>` XML for DOCX).
     - If text is too short (< 20 chars), returns the regex fallback directly.
     - Otherwise builds `buildResumeAnalysisPrompt(rawText)` and calls `groqService.generateResponse` (LLM, `maxTokens: 2000`, `temperature: 0.3`) to get structured JSON.
     - Normalizes the LLM output and computes scores with `resumeScoringService.calculateAllScores`.
     - On any LLM/parse error, catches and calls `buildFallback` (regex parser) so the request always succeeds.
  4. Scores are persisted and the enriched result is returned to the frontend.
- **Scoring engine (`resumeScoringService.js`)** — fully deterministic (no AI):
  - ATS keyword bank of ~55 keywords grouped into 7 categories (Languages, Frontend, Backend, Databases, Cloud/DevOps, Tools, Core CS).
  - Section weights: formatting 0.15, keywords 0.20, skills 0.15, projects 0.20, experience 0.20, education 0.10.
  - Each section returns `{ score, reason }`; overall `atsScore = Σ(section × weight)`, capped at 96.
  - Derived metrics: `resumeRank = 101 - atsScore`, `topPercentile` (Top 5% / 10% / 20% / 35% / 50% / Bottom 50%).
- **Fallback parser (`resumeFallbackParser.js`)** — regex extraction for email, phone, LinkedIn, GitHub, skills, education, experience, projects, certifications; rule-based strengths/weaknesses, `SDE_MUST_HAVE` missing keywords (docker, aws, system design, rest api, typescript, kubernetes, ci/cd), and 8 suggestions.
- **Endpoints:** `POST /upload`, `POST /analyze`, `POST /rewrite`, `POST /job-match`, `GET /history/:userId`, `GET /latest/:userId`, `DELETE /:id` (all protected).
- **Frontend:** `ResumeAnalyzerPage.jsx` orchestrates upload → analysis → optional job-description match → optional rewrite. Components: `ResumeUpload`, `ResumeReadiness` (ATS meter), `StrengthsCard`, `KeywordAnalysis`, `ResumeSectionAnalysis` (accordion), `SuggestionsCard`, `ResumeInsightsPanel`, `ResumeQuickActions`, and `LoadingState`/`EmptyState`/`GeneratingState`.

#### 5.5.3.1 Resume Rewriting (sub-feature)

- `resumeRewriteService.rewriteResume` — extracts text, sends `buildResumeRewritePrompt` (optionally tailors to a pasted JD) to Groq, parses the structured JSON, then programmatically generates both a `.docx` (via the `docx` library) and an `.pdf` (via `pdfkit`) in `backend/generated-resumes/`, with a consistent visual style (Calibri, purple `#7C3AED` section headers, footer "Generated by HireVerse AI").
- **Endpoint:** `POST /api/resume/rewrite` (body: `{ resumeId, jobDescription? }`). Ownership is enforced before rewriting.

#### 5.5.3.2 Job-Description Matching (sub-feature)

- `jobDescriptionService.analyzeJobMatch` — extracts resume text, calls Groq with `buildJDAnalysisPrompt` to identify matched/missing keywords and skills, then computes a **deterministic** match score weighted as: keywordRatio 30 + skillRatio 25 + experienceRatio 20 + educationRatio 10 + projectRatio 15 (capped at 98). Suggestions are post-processed to surface missing Docker/Kubernetes/AWS/CI-CD when the JD implies them.
- **Endpoint:** `POST /api/resume/job-match` (body: `{ resumeId, jobDescription }`, JD ≥ 10 chars).

### 5.5.4 ATS Score Checker Module

- **Status: mock/placeholder.** `atsController.generateATS` returns a **random** score (`Math.floor(Math.random() * 30) + 70`, i.e. 70–100) with hard-coded strengths/weaknesses; `getATSReport` reads the stored doc. (`POST /api/ats/check`, `GET /api/ats/:userId`).
- The **real** ATS scoring happens inside the Resume Analyzer module (`resumeScoringService`); this standalone ATS route is a separate legacy-style stub.
- The repository also contains `resumeAnalysisController.js`, which is an **empty file** and is not wired to any route — analysis is handled by `resumeController.js` instead. It is orphan scaffolding left from an earlier iteration.

### 5.5.5 GitHub & LeetCode Report Modules

- **Status: mock data.** `githubController.analyzeGithub` and `leetcodeController.analyzeLeetcode` write **hard-coded** sample reports (e.g., 15 repos / 480 commits / score 78; 340 solved / contest rating 1580). (`POST /api/github/analyze`, `POST /api/leetcode/analyze`, plus `GET /:userId` readers).
- The **live** LeetCode integration lives in the DSA module (`LeetCodeProfile` via the LeetCode GraphQL API — see §5.5.6).

### 5.5.6 DSA Tracker Module

This module combines manual problem tracking with live LeetCode sync and AI coaching.

- **Problem CRUD (`dsaService.js`):** create/read/update/delete a `DSAProgress` document, toggle bookmark, increment revision count — all scoped to `req.user._id`. `dsaController` adds query filters (`status`, `difficulty`, `platform`, `topic`, `bookmarked`).
- **Analytics (`dsaAnalyticsService.calculateDashboard`):**
  - `contestRating = min(3800, 1500 + easy×2 + medium×5 + hard×10)` (derived heuristic, not real contest data).
  - Current streak computed from consecutive unique solve dates (breaks reset it).
  - Topic progress, strongest/weakest topics, `readinessScore = (contestRating / 3800) × 100`.
  - Weekly/monthly solved counts and improvement percentage; 90-day activity heatmap array.
- **AI Coach (`dsaCoachService.generateDSAInsights`):**
  - Cached per user for 24 hours (`DSAInsight`).
  - With zero solves, returns a static **beginner roadmap** (encouragement + 7-day plan) — no LLM call.
  - Otherwise builds a context block from the dashboard, calls Groq with a strict "never hallucinate data" system prompt, validates the JSON, and upserts the `DSAInsight`.
- **Live LeetCode (`leetcodeService.js`):** fetches profile + contest data from the public LeetCode GraphQL endpoint (two parallel queries, 15 s timeout), stores in `LeetCodeProfile` with a 12-hour cache; on refresh failure it silently returns the stale cached copy.
- **Endpoints (all protected):** `POST /`, `GET /`, `GET /dashboard`, `GET /coach`, `GET /leetcode`, `POST /leetcode/connect`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/bookmark`, `PATCH /:id/revise`.
- **Frontend:** `DSATrackerPage.jsx` renders a dense analytics dashboard: `StatsCards`, `ActivityHeatmap`, `CompanyReadiness`, `AIInsights`, `LeetCodeCard`, `ProblemsTable`, `ProblemModal` (add/edit), plus custom analytics cards ("Where You're Losing Time", "Most Retried Problems", "Weekly Insights", "Contest Performance") computed client-side from the problems list. Styling is isolated in `frontend/src/styles/dsa.css`, which ships its own light + dark palettes (scoped under `.dsa-tracker` and `.dark .dsa-tracker`) so the module's premium theme works in both color modes.

> **Note:** the project `readme.md` documents an older DSA API (`/update-progress`, `/topics`, `/heatmap`, `/suggestions`, `/add-problem`, `/update-streak`). The current implementation uses the CRUD-based API described above; the README is partially out of date relative to the code.

### 5.5.7 AI Mock Interview Module

The flagship voice-enabled module.

- **Backend flow (`mockInterviewController` + `mockInterviewService`):**
  1. `POST /api/mock/start` — validates `type`/`difficulty` against the model enums, generates the first question via Groq (`generateInterviewQuestion`), creates a `MockInterview` doc (`status: "started"`), and optionally synthesizes speech with Piper.
  2. `POST /api/mock/:id/answer` — appends the answer to the transcript, evaluates it via Groq (`evaluateSingleAnswer`, with **one retry** on failure that does not crash the interview), then either generates the next question (up to `QUESTIONS_PER_INTERVIEW = 6`) or, after the last answer, auto-generates the final report and completes the interview.
  3. `POST /api/mock/:id/end` — evaluates all answered questions at once (`evaluateInterview`) and stores the report; falls back to a zeroed report on error.
  4. `GET /api/mock/:id/report` — returns the report (only after completion).
  5. `GET /api/mock/history` — paginated history (default page size 10), excluding transcript/questions for lighter payloads.
  6. `POST /api/mock/transcribe` — accepts an uploaded audio file (multer, disk storage, `.webm` etc.), runs Groq Whisper (`whisper-large-v3-turbo`), deletes the temp file, returns the transcript text.
  7. `POST /api/mock/:id/speak` — synthesizes arbitrary text via Piper and returns a URL.
  - Ownership guard: every `findOwnedInterview` helper returns 404 if missing and 403 if the interview belongs to another user.
- **Interview report generation:** per-answer evaluations are averaged into 5 dimensions (`overallScore`, `communication`, `technicalKnowledge`, `confidence`, `problemSolving`), then Groq produces a final report JSON (strengths, weaknesses, recommendations, summary, `hiringDecision` from `[Strongly Recommended, Recommended, Consider, Not Recommended]`, `difficultyLevel`). If the final report call fails, the service falls back to the averaged scores so the user still sees a report.
- **Prompts (`interviewPrompts.js`):** strict single-question prompt (≤ 35 words, never repeat prior questions), JSON-only evaluation prompts, and a JSON-only final-report prompt.
- **Frontend:** `MockInterviewPage.jsx` implements a 3-state machine (`EMPTY → INTERVIEW → COMPLETED`). `useAudioRecorder` wraps the browser `MediaRecorder` API (`getUserMedia`), records WebM, uploads to `/mock/transcribe`, and exposes `idle/recording/transcribing/ready` states. `LiveTranscript` renders the running transcript + timer; `InterviewReport` renders the score ring and feedback. Question audio is played back through the `piperSpeechService` helper.

### 5.5.8 Career Copilot Module

Two distinct backends exist and are both wired into the same router:

1. **Placement-mentor chat (real LLM) — `careerCopilotService` / `careerCopilotController`:**
   - `POST /api/copilot/chat` → `careerCopilotController.postChatMessage` → `careerCopilotService.generateCareerResponse`.
   - Before calling Groq, it loads **twelve collections in parallel** (`Promise.all`): user, profile, latest resume, latest ATS report, DSA progress, last 5 mock interviews, roadmap, weekly plan, internships, GitHub report, LeetCode report, and the copilot profile itself.
   - These are flattened into a human-readable context block (name, college, skills, resume/ATS score, DSA progress, mock scores, roadmap, weekly goals, internship progress, readiness, GitHub/LeetCode stats) and injected into `buildCareerCopilotPrompt`, whose system prompt enforces that the model act as a personal placement mentor using the student's actual profile ("You are NOT ChatGPT").
   - The reply is returned and the conversation is **not** persisted here (the frontend keeps chat in memory).
2. **Dashboard engine (keyword-based, deterministic) — `copilotService` / `copilotController`:**
   - `GET /api/copilot/dashboard`, `GET /api/copilot/chat`, `POST /generate-plan`, `POST /update-goal`, `GET /readiness` all route to `copilotController`, which uses `copilotService`.
   - The service's own code comments state explicitly that its "AI engine is a deterministic keyword-matcher, NOT a real LLM call", and that `generateAIResponse()` is designed as a drop-in replacement point for a real API later.
   - It seeds a default profile (readiness 72%, target Amazon, estimated 4 months; 5 focus areas; 4 weekly goals; 3 insights), builds 30-day action plans from per-company templates (`Amazon`/`Google`/`Default`) with week statuses `done/current/upcoming`, matches chat-style patterns by regex (crack-company, next-week, review-profile, mock-interview, compare, plan, github), recalculates readiness as the mean of focus-area progress, and shapes a dashboard response with hashed chip colors and progress-based hex colors.
- **Endpoints (all protected):** `GET /dashboard`, `GET /chat`, `POST /chat`, `POST /generate-plan`, `POST /update-goal`, `GET /readiness`.
- **Frontend:** `CareerCopilotPage.jsx` loads the dashboard + chat history, renders `CopilotChat`, `SuggestedPrompts`, `ReadinessRingCard`, `FocusAreas`, `WeeklyChecklistCard`, and `QuickInsights`. The chat message flow sends `POST /api/copilot/chat` and appends `data.reply` as the AI bubble.

### 5.5.9 Roadmap, Weekly Plan & Internship Modules

- **Status: seeded/hard-coded data.**
  - `roadmapController.createRoadmap` persists a fixed 3-month Amazon SDE I roadmap (`Foundations → Structures → Advanced`). (`POST /api/roadmap/create`, `GET /api/roadmap/:userId`)
  - `weeklyPlanController.createWeeklyPlan` persists a fixed Monday–Sunday task plan with `progress: 65`. (`POST /api/weekly-plan/create`, `GET /api/weekly-plan/:userId`)
  - `internshipController.seedInternships` inserts 5 sample applications (`Google STEP`, `Amazon SDE`, `Microsoft Explore`, `Atlassian`, `Stripe`) with mixed statuses; `getInternships` returns them plus computed counts (`applied`, `interview`, `selected`, `rejected`). (`POST /api/internship/seed`, `GET /api/internship/:userId`)
- These are scaffolding modules intended to be wired to real forms/CRUD in a later iteration; the frontend services (`roadmapService`, `weeklyPlanService`, `internshipService`) exist but the corresponding pages are placeholders.

### 5.5.10 Dashboard Module

- **Purpose:** landing page after login summarizing overall placement progress.
- **Frontend-only:** `DashboardPage.jsx` composes `HeroCard` (readiness ring), `UpcomingGoals`, `StatCards`, `SkillBreakdown`, and `QuickActions`. The cards are currently rendered from design data rather than live API data (there is no `/api/dashboard` endpoint).

---

## 5.6 AI/ML Integration

### 5.6.1 Groq LLM (llama-3.3-70b-versatile)

All LLM traffic flows through `groqService` with a single model constant. Five wrapper functions are provided:

| Function | Purpose | max_tokens | temperature |
|---|---|---|---|
| `generateInterviewQuestion` | single interview question | 150 | 0.7 |
| `evaluateInterview` | batch verdict + 4 dimension scores | 500 | 0.3 |
| `evaluateSingleAnswer` | per-answer scores + ideal answer | 500 | 0.3 |
| `generateFinalReport` | final hiring report JSON | 1000 | 0.3 |
| `generateResponse` | generic system+user prompt | configurable | configurable |

Every JSON-returning function defensively extracts the first `{...}` block with a regex and clamps all numeric scores to 0–100, so malformed or out-of-range model output cannot corrupt stored data.

### 5.6.2 Groq Whisper (whisper-large-v3-turbo)

`whisperService.transcribeAudio` streams the uploaded file to `client.audio.transcriptions.create` and returns the plain-text transcript. Used for the voice-answer flow.

### 5.6.3 Piper TTS (local)

`piperService.generateSpeech` spawns the Piper executable (`PIPER_PATH`, auto-appends `.exe` on Windows) with `--model <PIPER_MODEL> --output_file <wav>`, pipes the text to stdin, and writes the synthesized audio to `backend/public/audio/question_<timestamp>.wav`, served at `/audio/...`. If Piper is not configured, the interview flow degrades gracefully (the question is still shown as text).

### 5.6.4 Prompt Engineering

Five prompt modules centralize all LLM instructions:
- `interviewPrompts.js` — question generation, answer evaluation, batch evaluation, final report.
- `resumeAnalysisPrompt.js` — strict JSON extraction of resume structure.
- `jobDescriptionAnalysisPrompt.js` — matched/missing keyword & skill comparison.
- `resumeRewritePrompt.js` — fact-preserving rewrite (optional JD tailoring), JSON output.
- `careerCopilotPrompt.js` — placement-mentor system prompt fed with the live profile context.

All prompts enforce "Return ONLY valid JSON. No markdown, no code fences" for structured outputs, which is matched by the defensive JSON extraction on the service side.

### 5.6.5 Deterministic Engines (deliberately not AI)

Several "AI-looking" outputs are actually deterministic by design, guaranteeing reproducibility:
- `resumeScoringService` — weighted ATS scoring with per-section reasons.
- `jobDescriptionService.calculateDeterministicScore` — weighted keyword/experience/education/project match score.
- `dsaAnalyticsService` — contest rating heuristic, streaks, readiness.
- `copilotService` — keyword-matched chat engine + plan templates (documented in-code as a placeholder for a real LLM).
- `dsaCoachService` beginner roadmap — static content for zero-solve users.

This hybrid approach means core scoring is stable and testable while generative AI is used only where open-ended text is genuinely needed.

---

## 5.7 API Design

All endpoints live under `/api` and return JSON. Protected endpoints require `Authorization: Bearer <JWT>` and validate that the authenticated user owns the resource (403 otherwise). A global `errorHandler` converts Mongoose validation/duplicate-key, JWT, and Multer errors into consistent JSON responses.

### 5.7.1 Complete Endpoint Map

| Module | Method & Path | Auth | Description |
|---|---|---|---|
| Auth | `POST /api/auth/register` | No | Register → JWT |
| Auth | `POST /api/auth/login` | No | Login → JWT |
| Auth | `GET /api/auth/profile` | Yes | Current user |
| User | `POST /api/users/add-xp` | Yes | Add XP, recalc level |
| Profile | `POST /api/profile` | No | Create profile |
| Profile | `GET /api/profile/:userId` | No | Get profile |
| Resume | `POST /api/resume/upload` | Yes | Upload file (no analysis) |
| Resume | `POST /api/resume/analyze` | Yes | Upload+analyze or `{resumeId}` |
| Resume | `POST /api/resume/rewrite` | Yes | Generate DOCX+PDF rewrite |
| Resume | `POST /api/resume/job-match` | Yes | JD match analysis |
| Resume | `GET /api/resume/history/:userId` | Yes | Paginated history |
| Resume | `GET /api/resume/latest/:userId` | Yes | Latest analyzed resume |
| Resume | `DELETE /api/resume/:id` | Yes | Delete doc + file |
| ATS | `POST /api/ats/check` | No | Mock ATS report |
| ATS | `GET /api/ats/:userId` | No | Get ATS report |
| GitHub | `POST /api/github/analyze` | No | Mock GitHub report |
| GitHub | `GET /api/github/:userId` | No | Get GitHub report |
| LeetCode | `POST /api/leetcode/analyze` | No | Mock LeetCode report |
| LeetCode | `GET /api/leetcode/:userId` | No | Get LeetCode report |
| DSA | `POST /api/dsa` | Yes | Create problem |
| DSA | `GET /api/dsa` | Yes | List problems (filters) |
| DSA | `GET /api/dsa/dashboard` | Yes | Full analytics dashboard |
| DSA | `GET /api/dsa/coach` | Yes | AI coach insights (24h cache) |
| DSA | `GET /api/dsa/leetcode` | Yes | Cached LeetCode profile |
| DSA | `POST /api/dsa/leetcode/connect` | Yes | Connect LeetCode username |
| DSA | `GET /api/dsa/:id` | Yes | Single problem |
| DSA | `PUT /api/dsa/:id` | Yes | Update problem |
| DSA | `DELETE /api/dsa/:id` | Yes | Delete problem |
| DSA | `PATCH /api/dsa/:id/bookmark` | Yes | Toggle bookmark |
| DSA | `PATCH /api/dsa/:id/revise` | Yes | Increment revision count |
| Mock | `POST /api/mock/start` | Yes | Start interview |
| Mock | `GET /api/mock/history` | Yes | Paginated history |
| Mock | `POST /api/mock/transcribe` | Yes | Whisper transcription |
| Mock | `POST /api/mock/:id/speak` | Yes | Piper TTS |
| Mock | `GET /api/mock/:id` | Yes | Get interview state |
| Mock | `POST /api/mock/:id/answer` | Yes | Submit answer |
| Mock | `POST /api/mock/:id/end` | Yes | End + generate report |
| Mock | `GET /api/mock/:id/report` | Yes | Get report |
| Mock | `DELETE /api/mock/:id` | Yes | Delete interview |
| Copilot | `GET /api/copilot/dashboard` | Yes | Dashboard data |
| Copilot | `GET /api/copilot/chat` | Yes | Chat history |
| Copilot | `POST /api/copilot/chat` | Yes | Placement-mentor reply (LLM) |
| Copilot | `POST /api/copilot/generate-plan` | Yes | 30-day plan for company |
| Copilot | `POST /api/copilot/update-goal` | Yes | Toggle weekly goal |
| Copilot | `GET /api/copilot/readiness` | Yes | Readiness breakdown |
| Roadmap | `POST /api/roadmap/create` | No | Seeded 3-month roadmap |
| Roadmap | `GET /api/roadmap/:userId` | No | Get roadmap |
| Weekly Plan | `POST /api/weekly-plan/create` | No | Seeded weekly plan |
| Weekly Plan | `GET /api/weekly-plan/:userId` | No | Get weekly plan |
| Internship | `POST /api/internship/seed` | No | Insert 5 sample apps |
| Internship | `GET /api/internship/:userId` | No | Apps + status counts |
| Health | `GET /api/health` | No | `{ status, timestamp }` |

> Approximately **52 endpoints** across 13 route modules (plus health).

### 5.7.2 Frontend API Layer

`frontend/src/services/api.js` configures an Axios instance (base URL `http://localhost:3001/api`) with:
- a **request interceptor** that injects the JWT from `localStorage` as `Authorization: Bearer ...`;
- a **response interceptor** that detects invalid/expired tokens on non-auth endpoints, clears storage, and redirects to `/login`.

Feature services (`dsaService`, `mockInterviewService`, `resumeService`, etc.) wrap these calls so pages never touch Axios directly.

---

## 5.8 Frontend Implementation Details

### 5.8.1 Routing & Providers

`App.jsx` wraps `<BrowserRouter>` with `ThemeProvider` then `AuthProvider`, and declares 7 routes: `/` (redirect → `/dashboard`), `/Signup`, `/Login`, `/dashboard`, `/resume`, `/dsa`, `/mock`, `/copilot`.

### 5.8.2 Theming

- `ThemeContext` persists the user's choice in `localStorage` (`hireverse-theme`), falls back to the OS `prefers-color-scheme`, and toggles the `dark`/`light` class on `<html>`.
- `index.css` defines ~50 CSS custom properties for light mode in `:root` and dark mode in `.dark` (backgrounds, borders, text, badge colors, heatmap intensities, shadows, gradients). Tailwind is configured with `darkMode: "class"`, so components can mix `var(--…)` styling with Tailwind utilities.
- The DSA module additionally ships `styles/dsa.css` with self-contained light/dark palettes scoped to `.dsa-tracker` and `.dark .dsa-tracker`, guaranteeing a consistent premium look in both modes even when global CSS variables differ.

### 5.8.3 Reusable Component Inventory

- **Layout:** `Navbar` (top bar: sidebar toggle, search, bell, avatar), `Sidebar` (left nav to all modules).
- **Auth:** `AuthLayout`, `SigninForm`, `SignupForm`.
- **UI:** `Logo`, `InputField`, `FeaturePills`.
- **Dashboard (6):** `HeroCard`, `ReadinessRing` (animated SVG ring), `StatCards`, `SkillBreakdown`, `UpcomingGoals`, `QuickActions`.
- **Resume (11):** `ResumeUpload`, `ResumeStates` (loading/empty), `ResumeReadiness`, `ATSScoreCard`, `KeywordAnalysis`, `StrengthsCard`, `ResumeSectionAnalysis`, `SuggestionsCard`, `ResumeInsightsPanel`, `ResumeQuickActions`.
- **DSA (19):** `DSAStates`, `DSAReadiness`, `StatsCards`, `TopicProgress`, `TopicBreakdown`, `ActivityHeatmap`, `AIInsights`, `SuggestedProblems`, `StruggleAnalysis`, `ContestPerformance`, `LeetCodeCard`, `GoalsCard`, `ProblemsTable`, `ProblemModal`, `Toast`, `CompanyReadiness`.
- **Interview (8):** `InterviewStates` (state constants), `InterviewSetup`, `InterviewPanel`, `LiveTranscript`, `InterviewReport`, `SkillBreakdown`, `AIFeedback`.
- **Copilot (10):** `CopilotStates`, `CopilotChat`, `ChatMessage`, `SuggestedPrompts`, `ReadinessCard`, `ActionPlanCard`, `FocusAreas`, `QuickInsights`.

### 5.8.4 Voice Recording Hook

`useAudioRecorder` wraps `navigator.mediaDevices.getUserMedia({ audio: true })` + `MediaRecorder`, collects WebM chunks, uploads to `POST /mock/transcribe`, and manages a 4-state machine (`idle → recording → transcribing → ready`), surfacing permission-denied / no-microphone errors gracefully.

### 5.8.5 Dummy Data

The frontend ships `resumeDummyData`, `dsaDummyData`, `mockInterviewDummyData`, and `copilotDummyData` used to render placeholder/design states while real API responses load or when pages are not yet fully wired to the backend.

---

## 5.9 Testing & Validation

The project's automated test setup is minimal at this stage:

- **Linting:** `frontend/package.json` defines `npm run lint` (`eslint . --report-unused-disable-directives --max-warnings 0`); the frontend was kept lint-clean while the DSA module was developed.
- **Backend test script:** `backend/package.json` declares `npm test` (`jest --forceExit`), but **no test files are present in the repository** — the script is scaffolded but not populated.
- **Runtime validation** is handled primarily through:
  - Mongoose schema constraints (required fields, enums, min/max bounds) on every model.
  - Controller-level input validation with explicit 400 responses (e.g., interview type/difficulty, JD length ≥ 10, non-empty chat messages).
  - Ownership checks returning 403 for cross-user access on resume, interview, job-match, and rewrite endpoints.
  - Defensive parsing/clamping of all LLM JSON output so malformed model responses degrade rather than crash.
  - Graceful fallbacks throughout: regex resume parser if Groq fails, averaged-scores report if final-report generation fails, stale LeetCode cache if a refresh fails, no Piper audio if TTS is not configured.

---

## 5.10 Challenges Faced and Solutions

| # | Challenge | Solution Implemented |
|---|---|---|
| 1 | LLM output is inconsistent / occasionally invalid JSON. | A single defensive layer (`safeParseJSON`, regex `{...}` extraction, 0–100 clamping, array coercion) across every Groq consumer. |
| 2 | Resumes come in PDF and DOCX with no standard layout. | Dual extraction path: `pdf-parse` for PDF and raw `<w:t>` XML regex for DOCX; a regex fallback parser guarantees analysis even when the LLM fails. |
| 3 | Mock interviews must never die on an evaluation failure. | `evaluateWithRetry` (1 retry), a non-throwing evaluation step, and a fallback averaged report if the final-report call fails. |
| 4 | Voice answer flow depends on an external Whisper API. | The recording flow is decoupled: upload → transcribe → user can review/edit transcript before submitting, with clear error states for microphone permission issues. |
| 5 | Piper TTS is a local, platform-specific executable. | `PIPER_PATH`/`PIPER_MODEL` env vars, automatic `.exe` suffix on Windows, and graceful text-only degradation when TTS is unavailable. |
| 6 | LeetCode API is unauthenticated and rate-limited. | 12-hour DB cache with stale-cache fallback; parallel GraphQL queries with a 15-second abort timeout. |
| 7 | Expensive AI coaching calls on every page load. | 24-hour `DSAInsight` cache + static beginner roadmap for users with no solves. |
| 8 | 401 token-expiry UX mid-session. | Axios response interceptor clears credentials and redirects to `/login` only on genuine token failures (not on auth-route 400s). |
| 9 | Cross-feature duplication (many modules read the user's profile data). | A shared "context gatherer" in `careerCopilotService` loads 12 collections in parallel and flattens them into one prompt context. |
| 10 | Dark-mode styling broke when a new module used its own theme. | Isolated scoped palettes per module (`dsa.css` under `.dsa-tracker` / `.dark .dsa-tracker`) instead of relying solely on global variables. |

---

## 5.11 Future Scope

The following extensions are the natural next steps, several of which are already scaffolded in the code:

1. **Replace the keyword-matched Copilot dashboard engine with a real LLM** — the in-code drop-in point (`generateAIResponse`) is explicitly designed for this.
2. **Persist Copilot chat conversations** — currently the LLM chat reply is returned but not stored (unlike the dashboard's `chatHistory`).
3. **Wire real forms/CRUD for Roadmap, Weekly Plan, Internship, and Profile** — controllers currently seed hard-coded data.
4. **Remove mock ATS/GitHub/LeetCode report endpoints** or back them with real integrations (GitHub REST API, live ATS scoring already exists in the resume module).
5. **Add Jest test files** for the deterministic engines (scoring, analytics, streak logic) — the script is already declared.
6. **Move AI features behind a unified provider abstraction** (e.g., swap Groq for OpenAI/Anthropic) using the existing `generateResponse` seams.
7. **Containerize the app** (Docker for the API, Piper, and frontend) and move file storage to object storage (S3/Cloudinary).
8. **Add a real Placement Dashboard API** — the dashboard page is currently frontend-only with design data.
9. **Expand voice features** (full spoken interview flow, accent robustness, audio streaming) and add rate limiting / usage quotas for AI endpoints.
10. **Reconcile configuration drift** (default port 5000 vs. the documented/consumed port 3001) and publish API references for the DSA and Mock Interview modules (templates already exist at `backend/DSA_API_REFERENCE.md` and `backend/MOCKINTERVIEW_API_REFERENCE.md`).

---

## 5.12 Project Summary

HireVerse demonstrates a production-shaped, AI-integrated full-stack system:

- **Backend (Node.js/Express + MongoDB/Mongoose):** 15 models, 13 route modules (52 endpoints), 17 controllers, 15 services, 5 prompt modules, and a layered architecture with JWT auth, multer uploads, static file serving, and a global error handler.
- **Frontend (React 18 + Vite + Tailwind):** 7 routed pages, ~60 reusable components across 8 folders, theming (light/dark via CSS variables), Axios interceptors, and a voice-recording hook.
- **AI integration:** Groq Llama 3.3 (interview Q&A + evaluation + reports, resume analysis, JD matching, resume rewrite, DSA coaching, placement mentor), Groq Whisper (speech-to-text), Piper (text-to-speech), and a live LeetCode GraphQL connector with caching.
- **Design philosophy:** hybrid AI — generative LLMs only where open-ended text is needed, deterministic engines where reproducibility matters, graceful degradation everywhere, and ownership-aware security on all user resources.

The result is a cohesive platform where a student can upload a resume, get an ATS score and actionable feedback, track DSA practice with AI coaching, sit a voice-enabled AI mock interview with a written report, and ask a profile-aware placement mentor for a concrete 30-day plan.
