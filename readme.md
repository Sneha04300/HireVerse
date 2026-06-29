# HireVerse — Collaborative Project README

> A placement preparation platform with Resume ATS Analysis, DSA Tracking, AI Mock Interviews, and a Career Copilot.

---

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [Auth Flow (Login & Signup)](#2-auth-flow-login--signup)
3. [Dashboard Flow](#3-dashboard-flow)
4. [Resume Analyzer Flow](#4-resume-analyzer-flow)
5. [DSA Tracker Flow](#5-dsa-tracker-flow)
6. [AI Mock Interview Flow](#6-ai-mock-interview-flow)
7. [Career Copilot Flow](#7-career-copilot-flow)
8. [API Endpoint Summary](#8-api-endpoint-summary)

---

## 1. Project Structure

### Root
```
HireVerse/
├── readme.md                     # This file — collaborative project documentation
├── package.json                  # Root package (unused, can be removed)
├── package-lock.json
│
├── backend/                      # Express + MongoDB API server
│   ├── server.js                 # Entry point: loads env, connects DB, mounts routes, starts server
│   ├── package.json              # Dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, multer, pdf-parse
│   ├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL)
│   ├── .env.example              # Template for .env
│   ├── .gitignore
│   ├── uploads/                  # Resume PDF/DOCX uploads stored here
│   └── src/
│       ├── app.js                # Alternative Express app — mounts all route modules
│       ├── config/
│       │   ├── db.js             # Mongoose connection to MongoDB with 5s timeout
│       │   └── multerConfig.js   # Multer config: stores files in uploads/, .pdf/.docx only, 5MB limit
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT auth: extracts Bearer token or cookie, verifies, attaches req.user
│       │   └── errorHandler.js    # Global error handler: Mongoose validation, duplicate key, JWT, Multer errors
│       ├── models/
│       │   ├── user.js            # User: name, email, password (hashed), xp, level, badges, streak, lastActiveDate
│       │   ├── Profile.js         # Profile: college, branch, graduationYear, cgpa, skills, github, leetcode, linkedin, targetCompany, targetRole
│       │   ├── Resume.js          # Legacy resume model (basic)
│       │   ├── ResumeAnalysis.js  # Resume analysis: ATS score, section scores, strengths, weaknesses, keywords, extracted data, status
│       │   ├── ATSReport.js       # ATS report: userId, score, strengths[], weaknesses[]
│       │   ├── GithubReport.js    # GitHub report: userId, repos, commits, stars, score, skills
│       │   ├── LeetcodeReport.js  # LeetCode report: userId, solved counts, contest rating, topic strengths
│       │   ├── DSAProgress.js     # DSA progress: streaks, solved count, 12 topics, heatmap, contest stats, weak/strong topics
│       │   ├── MockInterview.js   # Mock interview: type, difficulty, questions/answers/scores, transcript, report
│       │   ├── CareerCopilot.js   # Copilot: chat history, readiness, focus areas, weekly goals, insights, action plan
│       │   ├── Roadmap.js         # Roadmap: targetRole, currentSkills, 3-month monthly phase roadmap
│       │   ├── WeeklyPlan.js      # Weekly plan: progress %, Mon–Sun tasks with category
│       │   └── Internship.js      # Internship: company, role, date, status (Applied/OA/Interview/Rejected/Selected)
│       ├── controllers/
│       │   ├── authController.js      # registerUser (bcrypt hash + JWT), loginUser (verify + JWT), getProfile
│       │   ├── userController.js      # addXP: add XP, recalculate level as Math.floor(xp/100)+1
│       │   ├── profileController.js   # createProfile, getProfile by userId
│       │   ├── resumeController.js    # uploadResume, analyzeResume (text extraction + scoring), getHistory, getLatest, delete
│       │   ├── atsController.js       # generateATS (mock score 70-100), getATSReport
│       │   ├── githubController.js    # analyzeGithub (mock report), getGithubReport
│       │   ├── leetcodeController.js  # analyzeLeetcode (mock report), getLeetcodeReport
│       │   ├── dsaController.js       # updateProgress, getDashboard, getTopics, getHeatmap, getSuggestions, addProblem, updateStreak
│       │   ├── mockInterviewController.js  # startInterview, getInterview, submitAnswer, endInterview, getReport, getHistory, delete
│       │   ├── copilotController.js   # getDashboard, getChatHistory, postChatMessage, generatePlan, updateGoal, getReadiness
│       │   ├── roadmapController.js   # createRoadmap (hardcoded 3-month Amazon plan), getRoadmap
│       │   ├── weeklyPlanController.js # createWeeklyPlan (hardcoded Mon-Sun plan), getWeeklyPlan
│       │   └── internshipController.js # seedInternships (insert 5 sample apps), getInternships
│       ├── routes/
│       │   ├── authRoutes.js          # POST /register, POST /login, GET /profile (protected)
│       │   ├── userRoutes.js          # POST /add-xp (protected)
│       │   ├── profileRoutes.js       # POST /, GET /:userId
│       │   ├── resumeRoutes.js        # POST /upload, POST /analyze, GET /history/:userId, GET /latest/:userId, DELETE /:id (all protected)
│       │   ├── atsRoutes.js           # POST /check, GET /:userId
│       │   ├── githubRoutes.js        # POST /analyze, GET /:userId
│       │   ├── leetcodeRoutes.js      # POST /analyze, GET /:userId
│       │   ├── dsaRoutes.js           # All protected: POST /update-progress, GET /dashboard, GET /topics, GET /heatmap, GET /suggestions, POST /add-problem, POST /update-streak
│       │   ├── mockInterviewRoutes.js # All protected: POST /start, GET /history, GET /:id, POST /:id/answer, POST /:id/end, GET /:id/report, DELETE /:id
│       │   ├── copilotRoutes.js       # All protected: GET /dashboard, GET /chat, POST /chat, POST /generate-plan, POST /update-goal, GET /readiness
│       │   ├── roadmapRoutes.js       # POST /create, GET /:userId
│       │   ├── weeklyPlanRoutes.js    # POST /create, GET /:userId
│       │   └── internshipRoutes.js    # POST /seed, GET /:userId
│       └── services/
│           ├── resumeService.js        # PDF text extraction (pdf-parse), regex field extraction, ATS scoring engine (6 categories), strengths/weaknesses, missing keywords, AI suggestions
│           ├── dsaService.js           # Streak logic (consecutive/day-gap/reset), heatmap (90-day), topic progress, weak/strong detection, recommendation engine, suggested problems from topic bank
│           ├── mockInterviewService.js # Question selection (6 per interview, by type+difficulty), heuristic answer scoring (word count, numbers, STAR, filler penalty), transcript, aggregate scoring with variance, feedback bank, verdict thresholds
│           └── copilotService.js       # Keyword-based AI response matcher (no LLM), 30-day plan templates (Amazon/Google/Default), readiness recalculation, dashboard response shaper with chip colors
│
└── frontend/                     # React + Vite + Tailwind frontend
    ├── index.html                # Root HTML shell — mounts React app at <div id="root">
    ├── vite.config.js            # Vite config: React plugin, dev server on port 5173
    ├── tailwind.config.js        # Custom brand colors, gradients, Inter font, fade-in animation
    ├── postcss.config.js         # Tailwind + Autoprefixer
    ├── eslint.config.js          # ESLint flat config with React hooks and refresh plugins
    ├── package.json              # React 18, react-router-dom v6, axios, Vite, Tailwind
    └── src/
        ├── main.jsx              # React entry: renders <App /> in StrictMode
        ├── App.jsx               # BrowserRouter + Routes: / -> /dashboard, /Signup, /Login, /dashboard, /resume, /dsa, /mock, /copilot
        ├── index.css             # Global Tailwind layers, .input-field, .btn-gradient, .feature-pill, .social-btn
        ├── App.css               # Legacy Vite starter styles
        ├── assets/               # hero.png, react.svg, vite.svg
        ├── pages/
        │   ├── Login.jsx                     # Wraps <SigninForm /> in <AuthLayout />
        │   ├── Signup.jsx                    # Wraps <SignupForm /> in <AuthLayout />
        │   ├── DashboardPage.jsx             # Navbar + Sidebar + HeroCard + StatCards + UpcomingGoals + SkillBreakdown + QuickActions
        │   ├── ResumeAnalyzerPage.jsx        # ResumeUpload + Loading/Empty states + ATSScoreCard + KeywordAnalysis + StrengthsCard + SuggestionsCard + SectionAnalysis + ResumeReadiness + InsightsPanel
        │   ├── DSATrackerPage.jsx            # StatsCards + TopicProgress + Heatmap + AIInsights + SuggestedProblems + TopicBreakdown + StruggleAnalysis + ContestPerformance + LeetCodeCard + GoalsCard + DSAReadiness
        │   ├── MockInterviewPage.jsx         # InterviewSetup + InterviewPanel + LiveTranscript + InterviewReport (3 states: empty/interview/completed)
        │   ├── CareerCopilotPage.jsx         # CopilotChat + SuggestedPrompts + ReadinessRingCard + FocusAreas + QuickInsights + WeeklyChecklist
        │   ├── ATSChecker.jsx               # Empty placeholder
        │   ├── GithubAnalysis.jsx            # Empty placeholder
        │   ├── LeetcodeAnalysis.jsx          # Empty placeholder
        │   ├── InternshipTracker.jsx         # Empty placeholder
        │   └── WeeklyPlan.jsx                # Empty placeholder
        ├── components/
        │   ├── auth/
        │   │   ├── AuthLayout.jsx            # Two-panel layout: left hero (logo + tagline + feature pills), right glassmorphism form card
        │   │   ├── SigninForm.jsx            # Email/password form, Google/GitHub OAuth buttons, calls API.post("/auth/login"), navigates to /dashboard on success
        │   │   └── SignupForm.jsx            # Full name, college, grad year, email, password, terms checkbox, calls API.post("/auth/register"), navigates to /login on success
        │   ├── layout/
        │   │   ├── Navbar.jsx                # Top bar: sidebar toggle, search, sign-in/sign-up links, notification bell, user avatar
        │   │   └── Sidebar.jsx               # Left nav: Dashboard, Resume, DSA, Mock Interviews, AI Copilot, Companies, Roadmap links
        │   ├── ui/
        │   │   ├── Logo.jsx                  # Gradient icon + "HireVerse / Placement OS" text
        │   │   ├── InputField.jsx            # Reusable input with label, icon, styled with autofill handling
        │   │   └── FeaturePills.jsx          # Feature pill grid: ATS Score, DSA Mastery, AI Copilot, Mock Interviews
        │   ├── dashboard/
        │   │   ├── HeroCard.jsx              # Readiness ring (72%) + insight text + score pills (Resume/Projects/DSA/Comms)
        │   │   ├── ReadinessRing.jsx         # Animated SVG circular progress ring with gradient stroke
        │   │   ├── StatCards.jsx             # 4-grid stats: Resume Score (84), LeetCode (340), GitHub (78), Interview (65)
        │   │   ├── SkillBreakdown.jsx        # Vertical skill bars with percentage for Resume, DSA, Projects, GitHub, Communication
        │   │   ├── UpcomingGoals.jsx         # Goal list with status badges (due/today/scheduled)
        │   │   └── QuickActions.jsx          # 2x3 action buttons: Scan Resume, ATS Check, Mock Interview, LeetCode, GitHub, DSA
        │   ├── resume/
        │   │   ├── ResumeUpload.jsx          # Drag-and-drop zone, .pdf/.docx only, 5MB limit, triggers analysis
        │   │   ├── ResumeStates.jsx          # LoadingState (spinner + step list) + EmptyState (feature preview cards)
        │   │   ├── ResumeReadiness.jsx       # 200px circular readiness meter with ATS score, placement impact, batch rank
        │   │   ├── ATSScoreCard.jsx          # Score ring + 5-category grid: Formatting, Keywords, Experience, Skills, Projects
        │   │   ├── KeywordAnalysis.jsx       # Missing keywords as red chips (REST API, Docker, AWS, etc.)
        │   │   ├── StrengthsCard.jsx         # Two-column green checks vs red X marks
        │   │   ├── ResumeSectionAnalysis.jsx # Accordion: Education/Skills/Projects/Experience/Certifications with score + feedback
        │   │   ├── SuggestionsCard.jsx       # Numbered AI suggestion list + "Generate Improved Resume" button
        │   │   ├── ResumeInsightsPanel.jsx   # Sidebar: ATS trend sparkline, industry benchmark bar, rank, top missing skills
        │   │   └── ResumeQuickActions.jsx    # Reanalyze, Download Report, Compare Previous, Generate Improved Resume
        │   ├── dsa/
        │   │   ├── DSAStates.jsx             # DSALoadingState (skeleton cards) + DSAEmptyState ("Connect LeetCode" CTA)
        │   │   ├── DSAReadiness.jsx          # Readiness ring (78%) + strengths/gaps pill lists
        │   │   ├── StatsCards.jsx            # 4-grid: Solved (320), Streak (28d), Daily Avg (3.4), Contest Rating (1650)
        │   │   ├── TopicProgress.jsx         # 2-column progress bars for all topics
        │   │   ├── TopicBreakdown.jsx        # Table: topic, solved, remaining, accuracy %
        │   │   ├── ActivityHeatmap.jsx       # 90-day GitHub-style heatmap, 5-intensity scale, hover tooltip
        │   │   ├── AIInsights.jsx            # Weakest/strongest topic, recommendation, streak note
        │   │   ├── SuggestedProblems.jsx     # AI-picked problem cards with difficulty badges + topic tags
        │   │   ├── StruggleAnalysis.jsx      # Most failed topic, avg attempts, weak patterns, most retried
        │   │   ├── ContestPerformance.jsx    # Contest stats + recent contest history with delta
        │   │   ├── LeetCodeCard.jsx          # Profile card: username, difficulty bars, acceptance, rank
        │   │   └── GoalsCard.jsx             # Weekly goals checklist with toggleable checkboxes + progress
        │   ├── interview/
        │   │   ├── InterviewStates.jsx       # STATE constants: EMPTY, INTERVIEW, COMPLETED
        │   │   ├── InterviewSetup.jsx        # Type + difficulty selectors + "Start Interview" button
        │   │   ├── InterviewPanel.jsx        # AI recruiter avatar, pulsing animation, question text, mic badge
        │   │   ├── LiveTranscript.jsx        # Transcript box, elapsed timer, question counter, end button
        │   │   ├── InterviewReport.jsx       # Score ring, skill breakdown bars, AI feedback, decision badge
        │   │   ├── SkillBreakdown.jsx        # Animated bar components for each skill
        │   │   └── AIFeedback.jsx            # Bullet list + colored decision pill
        │   └── copilot/
        │       ├── CopilotStates.jsx         # LoadingState (skeleton) + EmptyState (suggested prompts)
        │       ├── CopilotChat.jsx           # Scrollable chat with embedded readiness/plan cards, input bar
        │       ├── ChatMessage.jsx           # User bubble (purple right) + AI bubble (dark left with avatar)
        │       ├── SuggestedPrompts.jsx      # Clickable prompt buttons
        │       ├── ReadinessCard.jsx         # ReadinessRingCard (sidebar) + ReadinessCard (chat embed)
        │       ├── ActionPlanCard.jsx        # 4-week timeline with done/current/upcoming status dots
        │       ├── FocusAreas.jsx            # Progress bars for DSA, Projects, Resume, Communication, System Design
        │       └── QuickInsights.jsx         # WeeklyChecklistCard + AI insight items with trend/alert icons
        ├── services/
        │   ├── api.js                        # Axios instance: baseURL "http://localhost:3001/api"
        │   ├── atsService.js                 # getATSReport(userId) -> GET /ats/:userId
        │   ├── dsaService.js                 # getDSAProgress(userId) -> GET /dsa/:userId
        │   ├── githubService.js              # getGithubAnalysis(userId) -> GET /github/:userId
        │   ├── internshipService.js          # getInternships(userId) -> GET /internship/:userId
        │   ├── interviewService.js           # getInterviewReport(userId) -> GET /interview/:userId
        │   ├── leetcodeService.js            # getLeetcodeAnalysis(userId) -> GET /leetcode/:userId
        │   ├── profileServices.js            # getProfile(userId) -> GET /profile/:userId
        │   ├── resumeService.js              # getResumeAnalysis(userId) -> GET /resume/:userId
        │   ├── roadmapService.js             # getRoadmap(userId) -> GET /roadmap/:userId
        │   └── weeklyPlanService.js          # getWeeklyPlan(userId) -> GET /weekly-plan/:userId
        └── data/
            ├── resumeDummyData.js            # Mock: ATS 84%, breakdown, 10 missing keywords, strengths/weaknesses, 5 suggestions, 5 sections, trend, benchmark, rank
            ├── dsaDummyData.js               # Mock: 320 solved, 28d streak, 13 topics, 90-day heatmap, insights, 7 suggested problems, struggle analysis, contest history, LeetCode profile, weekly goals
            ├── mockInterviewDummyData.js     # Mock: 6 questions, live transcript, report (78%, 4 skills, 3 feedback items, "Likely Shortlist")
            └── copilotDummyData.js           # Mock: chat history, Amazon readiness (72%), 30-day plan, prompts, focus areas, checklist, insights
```

---

## 2. Auth Flow (Login & Signup)

### 2.1 Signup Flow

**Frontend → Backend → Database**

```
SignupPage (Signup.jsx)
  └─ AuthLayout (two-panel hero + form)
      └─ SignupForm.jsx
          1. User fills: fullName, college, gradYear, email, password, agree checkbox
          2. On submit: API.post("/auth/register", { name, email, password })
              └─ Axios instance (api.js) → http://localhost:3001/api/auth/register
                  │
                  ▼
Backend → authRoutes.js → POST /register → registerUser (authController.js)
          1. Destructure { name, email, password } from req.body
          2. Check if user exists: User.findOne({ email })
             → If yes: return 400 "User already exists"
          3. Generate salt: bcrypt.genSalt(10)
          4. Hash password: bcrypt.hash(password, salt)
          5. Create user: User.create({ name, email, password: hashedPassword })
             → Mongoose saves to MongoDB `users` collection
          6. Generate JWT: generateToken(user._id)
             → jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" })
          7. Return 201: { message, token, user: { id, name, email, xp, level } }
                  │
                  ▼
Frontend receives response:
          - Logs response.data (contains token + user)
          - Shows alert("Registration Successful!")
          - navigate("/login") → user is redirected to login page

NOTES:
- The token is NOT stored in localStorage/sessionStorage yet (feature gap)
- college and gradYear are collected in the UI but NOT sent to backend
- No email verification step
```

### 2.2 Login Flow

**Frontend → Backend → Database**

```
LoginPage (Login.jsx)
  └─ AuthLayout
      └─ SigninForm.jsx
          1. User fills: email, password
          2. On submit: API.post("/auth/login", { email, password })
              └─ http://localhost:3001/api/auth/login
                  │
                  ▼
Backend → authRoutes.js → POST /login → loginUser (authController.js)
          1. Destructure { email, password } from req.body
          2. Find user: User.findOne({ email })
             → If not found: return 400 "User not found"
          3. Compare password: bcrypt.compare(password, user.password)
             → If no match: return 400 "Invalid password"
          4. Generate JWT: generateToken(user._id)
             → jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" })
          5. Return 200: { message, token, user: { id, name, email, xp, level } }
                  │
                  ▼
Frontend receives response:
          - Logs response.data
          - navigate("/dashboard")
          - NO token stored → on page refresh, user loses auth state

NOTES:
- JWT is issued but never persisted (localStorage/sessionStorage not implemented)
- Auth middleware (authMiddleware.js) expects: Authorization: Bearer <token> OR cookie
- Google/GitHub OAuth buttons are visual-only (no OAuth backend)
- Protected routes on backend verify token via authMiddleware, attach user to req.user
```

### 2.3 Protected Route Flow

```
Frontend sends request → attaches no auth header (gap)
                │
Backend receives request → authMiddleware.protect
          1. Check req.headers.authorization?.startsWith("Bearer ")
             OR req.cookies?.token
          2. If no token → 401 "Not authenticated"
          3. jwt.verify(token, JWT_SECRET) → decoded { id }
          4. User.findById(decoded.id).select("-password") → req.user
          5. next() → controller executes

NOTE: Currently no frontend page actually sends the token because there's
no auth context/store. All pages use static dummy data.
```

---

## 3. Dashboard Flow

```
DashboardPage.jsx (static, no API calls)
  │
  ├── Navbar (sidebar toggle, search, user avatar)
  ├── Sidebar (navigation links)
  └── Main Content (all hardcoded dummy data)
      │
      ├── HeroCard
      │   └── ReadinessRing (72% — hardcoded)
      │   └── Static score pills
      │
      ├── UpcomingGoals
      │   └── Hardcoded list: "Solve 5 DP Problems" (due), "Improve Resume Summary" (due), "Mock Interview" (scheduled)
      │
      ├── StatCards
      │   └── 4-grid: Resume Score (84), LeetCode Solved (340), GitHub Score (78), Interview Score (65)
      │
      ├── SkillBreakdown
      │   └── Vertical bars: Resume, DSA, Projects, GitHub, Communication
      │
      └── QuickActions
          └── 2x3 grid: Scan Resume, ATS Check, Mock Interview, LeetCode, GitHub, DSA

DATA FLOW (if integrated):
  Dashboard should call:
    - GET /api/copilot/dashboard → career readiness stats
    - GET /api/dsa/dashboard → DSA stats
    - GET /api/resume/latest/:userId → latest resume score
  Currently: 100% static dummy data
```

---

## 4. Resume Analyzer Flow

### Current State (Static Dummy Data)
```
ResumeAnalyzerPage.jsx
  │
  ├── ResumeUpload → drag-and-drop file (simulated, no actual upload)
  │   └── handleAnalyze(): sets analyzing=true, after 3s sets analyzed=true
  │
  ├── LoadingState (spinner + step list during 3s delay)
  ├── EmptyState (when no file uploaded)
  └── Results (when analyzed=true, data from DUMMY_RESUME)
      │
      ├── ResumeQuickActions → Reanalyze, Download, etc.
      ├── ResumeReadiness → ATS score 84%, +12pts impact, Top 18%
      ├── ATSScoreCard → score ring + 5 categories (Formatting 90, Keywords 72, etc.)
      ├── StrengthsCard → 4 strengths vs 3 weaknesses
      ├── KeywordAnalysis → 10 missing keywords as red chips
      ├── ResumeSectionAnalysis → accordion: Education, Skills, Projects, Experience, Certifications
      ├── SuggestionsCard → 5 numbered AI suggestions
      └── ResumeInsightsPanel → trend sparkline, benchmark bar, rank meter, missing skills
```

### Backend Implementation (if connected)

```
Frontend: POST /api/resume/analyze (multipart/form-data with resume file)
  │
  ▼
Backend → resumeRoutes.js → protect middleware → multerUpload("resume")
  │
  ▼
resumeController.js → analyzeResume()
  1. Accepts file upload OR resumeId (for re-analysis)
  2. If file: saves to uploads/ with unique timestamp name, creates ResumeAnalysis doc (status: "pending")
  3. If resumeId: finds existing doc, resolves file path
  4. Calls resumeService.analyzeResume(filePath)
  │
  ▼
resumeService.js — Core analysis engine:
  │
  ├── extractTextFromPDF(filePath)
  │   └── fs.readFileSync + pdf-parse → raw text
  │
  ├── extractDataFromText(rawText)
  │   ├── extractName() → first non-email/URL/phone line in first 6 lines
  │   ├── extractEmail() → regex for email pattern
  │   ├── extractPhone() → regex for phone number
  │   ├── extractLinkedIn() → regex for linkedin.com/in/...
  │   ├── extractGitHub() → regex for github.com/...
  │   ├── extractSkills() → match against 60+ ATS keyword bank
  │   ├── extractEducation() → section finder + year/CGPA regex
  │   ├── extractExperience() → date-matching lines + bullet points
  │   ├── extractProjects() → tech stack + link detection
  │   └── extractCertifications() → section text lines
  │
  ├── scoreResume(extractedData, rawText)
  │   ├── Skills (25pts): skillCount/15 * 25
  │   ├── Projects (20pts): projCount/4 * 20
  │   ├── Experience (20pts): expCount/3 * 20
  │   ├── Education (10pts): has education ? 10 : 4
  │   ├── Keywords (15pts): hits/20 * 15
  │   └── Formatting (10pts): 2pts each for email, phone, linkedin, github, name
  │
  ├── analyzeStrengthsWeaknesses()
  │   ├── Strengths: 3+ projects, 10+ skills, has experience, linkedin, github, certifications, metrics, clean formatting
  │   └── Weaknesses: <6 skills, no experience, <2 projects, no github/linkedin, no certs, no metrics, no summary
  │
  ├── findMissingKeywords()
  │   └── SDE must-haves: docker, aws, system design, rest api, typescript, kubernetes, ci/cd
  │
  ├── generateSuggestions()
  │   └── Based on weaknesses → max 8 actionable suggestions
  │
  └── Returns: atsScore, sectionScores, strengths, weaknesses, suggestions, missingKeywords, extractedData
  │
  ▼
Controller persists results → ResumeAnalysis doc status="analyzed"
  Returns: { success, data { atsScore, sectionScores, strengths, weaknesses, suggestions, missingKeywords, extractedData } }
```

---

## 5. DSA Tracker Flow

### Current State (Static Dummy Data)
```
DSATrackerPage.jsx (page state toggle: "loading" | "empty" | "data")
  │
  ├── StatsCards → 320 solved, 28d streak, 3.4 avg, 1650 rating
  ├── DSAReadiness → 78% score, strengths: Arrays/Strings/Greedy, gaps: DP/Backtracking/Graphs
  ├── TopicProgress → 13 topics with progress bars
  ├── ActivityHeatmap → 90-day grid, 5 intensity levels
  ├── TopicBreakdown → table with solved/total/accuracy
  ├── StruggleAnalysis → most failed: DP, avg attempts: 3.2
  ├── ContestPerformance → 18 participated, best rank 142
  ├── SuggestedProblems → 7 LeetCode problems
  ├── AIInsights → weakest: DP, strongest: Arrays
  ├── LeetCodeCard → sneha_g26, 120/165/35 solved
  └── GoalsCard → 2/5 weekly goals done
```

### Backend Implementation

```
POST /api/dsa/update-progress { topicName, difficulty, count }
  │
  ▼
dsaService.js → recordProblemSolved(userId, { topicName, difficulty, count })
  │
  ├── getOrCreateProgress(userId)
  │   └── Find or create DSAProgress doc
  │
  ├── applyStreakLogic(doc)
  │   ├── No lastSolvedDate → streak = 1
  │   ├── Same day (diff=0) → no change
  │   ├── Consecutive day (diff=1) → streak += 1
  │   └── Gap (diff>1) → reset streak = 1
  │
  ├── incrementHeatmapDay(doc, count, date)
  │   ├── Find or create entry for date
  │   ├── Add count
  │   └── Prune to last 90 days
  │
  ├── recalculateDailyAverage(doc)
  │   └── Last 30 days: total solves / active days
  │
  ├── updateTopicProgress(doc, topicName, count)
  │   └── Increment solvedCount, recalculate percentage
  │
  ├── recalculateTopicStrengths(doc)
  │   ├── Sort topics by progressPercentage
  │   ├── weakTopics = bottom 3
  │   └── strongTopics = top 3
  │
  └── regenerateSuggestedProblems(doc)
      └── From weakTopics → TOPIC_PROBLEM_BANK → max 8 suggestions

GET /api/dsa/dashboard
  └── buildDashboardResponse(doc) → stats, topics, heatmap, aiInsights, suggestedProblems, contestStats

GET /api/dsa/heatmap → 90-day activityHeatmap
GET /api/dsa/topics → topicProgress breakdown
GET /api/dsa/suggestions → suggestedProblems (refreshes based on weakest topics)
```

---

## 6. AI Mock Interview Flow

### Interview Lifecycle
```
FRONTEND                          BACKEND
─────────                        ────────
InterviewSetup                   
  └─ Select type (Tech/HR/Mixed)  
  └─ Select difficulty (E/M/H)    
  └─ Click "Start Interview"      
      │                            
      POST /api/mock/start  ──────→ mockInterviewController.startInterview()
      { type: "Technical",          └─ mockInterviewService.startInterview()
        difficulty: "Medium" }          1. generateQuestions(type, difficulty)
                                          └─ "Tell me about yourself" always first
                                          └─ Shuffle rest, pick 5 more
                                          └─ Return 6 question objects
                                       2. Create MockInterview doc (status: "started")
                                       3. Add first AI transcript line
                                       4. status → "in_progress"
                                       5. Return interview doc
                    ←───────── interviewId, questions[0], status

InterviewPanel
  └─ Shows current question
  └─ User types answer
  └─ Clicks submit
  
      POST /api/mock/:id/answer  ──→ mockInterviewController.submitAnswer()
      { answer: "..." }              └─ mockInterviewService.submitAnswer(doc, text)
                                       1. Score answer: scoreAnswer(text)
                                          ├─ Baseline: 50
                                          ├─ Word count: 40-180 → +20, 20-40 → +10, <10 → -15
                                          ├─ Has numbers → +10
                                          ├─ Has STAR words → +10
                                          └─ Filler words → -3 each
                                       2. Store score on current question
                                       3. Add "User" transcript line
                                       4. If not last question: increment index, add next AI question
                                       5. Save doc
                    ←───────── { isLastQuestion, nextQuestion? }

  (repeat until last question answered)
  
  └─ Click "End Interview"

      POST /api/mock/:id/end  ────→ mockInterviewController.endInterview()
                                      └─ mockInterviewService.endInterview(doc)
                                         1. status = "completed"
                                         2. Set endedAt, calculate duration
                                         3. buildReport(doc)
                                            ├─ calculateAggregateScores()
                                            │   └─ Average of answered question scores
                                            │   └─ Add deterministic variance per metric (±0-6)
                                            │   └─ Returns { communication, confidence, technical, problemSolving }
                                            ├─ overallScore = average of 4 metrics
                                            ├─ verdict = calculateVerdict(overallScore)
                                            │   ├─ >=85 → "Strong Hire"
                                            │   ├─ >=70 → "Likely Shortlist"
                                            │   ├─ >=55 → "Average Candidate"
                                            │   └─ <55 → "Needs Improvement"
                                            └─ generateFeedback(doc, scores)
                                                └─ Based on threshold checks + feedback bank
                                         4. Save doc with report
                    ←───────── { report: { overallScore, communication, confidence, technical, problemSolving, feedback, verdict } }

InterviewReport sidebar displays:
  - Animated score ring (overallScore)
  - 4 skill breakdown bars
  - AI feedback bullets
  - Decision badge (color-coded verdict)
```

### Question Banks
```
QUESTION_BANK = {
  Technical: { Easy: [8 Qs], Medium: [9 Qs], Hard: [8 Qs] },
  HR: { Easy: [6 Qs], Medium: [7 Qs], Hard: [6 Qs] },
  Mixed: { Easy: [6 Qs], Medium: [7 Qs], Hard: [6 Qs] }
}
→ 6 questions per interview, "Tell me about yourself" always leads
```

---

## 7. Career Copilot Flow

### Chat Flow
```
CareerCopilotPage.jsx
  │
  ├── SuggestedPrompts (clickable: "Build me a 30-day Amazon prep plan", etc.)
  ├── CopilotChat
  │   └── User types message → handleSend(text)
  │       │
  │       POST /api/copilot/chat  ──→ copilotController.postChatMessage()
  │       { message: "..." }          └─ copilotService.handleChatMessage(userId, message)
  │                                       1. getOrCreateProfile(userId)
  │                                          └─ Find or create CareerCopilot doc with defaults
  │                                             (focusAreas, weeklyGoals, insights, readiness, plan)
  │                                       2. Push user message to chatHistory
  │                                       3. generateAIResponse(doc, message)
  │                                          └─ Keyword-based pattern matcher (NOT an LLM):
  │                                             │
  │                                             ├─ "crack <company>" / "X in months" → readiness score + focus areas
  │                                             ├─ "next week" / "what should I learn" → weakest area advice
  │                                             ├─ "review my profile" → strongest vs weakest comparison
  │                                             ├─ "mock interview" → improvement advice
  │                                             ├─ "compare" / "vs" → company bar comparison
  │                                             ├─ "30-day plan" → structured study plan
  │                                             ├─ "github" → activity tips
  │                                             └─ Fallback → overview of readiness + strongest/weakest
  │                                       4. Push AI response to chatHistory
  │                                       5. Save doc
  │                    ←───────── updated chatHistory
  │
  ├── ReadinessRingCard → 78% placement readiness
  ├── FocusAreas → 5 progress bars (DSA 70%, Projects 88%, Resume 84%, Communication 60%, System Design 45%)
  ├── WeeklyChecklistCard → 4 goals (3 done, 1 pending)
  └── QuickInsights → 3 insights (2 positive, 1 warning)
```

### Plan Generation
```
POST /api/copilot/generate-plan { company: "Amazon" }
  └─ copilotService.generatePlan(userId, company)
     ├── getOrCreateProfile(userId)
     ├── Set readiness.companyTarget = company
     ├── buildPlanFromTemplate(company)
     │   ├── Amazon: Week1=Arrays+Strings, Week2=Hashing, Week3=DP, Week4=Mock+Revision
     │   ├── Google: Week1=Graphs+Trees, Week2=System Design, Week3=Advanced DP, Week4=Mock+Behavioral
     │   └── Default: Week1=Core DS, Week2=Hashing+Searching, Week3=DP+Graphs, Week4=Mock+Resume
     └── Each week gets status: "done" / "current" / "upcoming" based on currentWeek=3
```

### Readiness Calculation
```
GET /api/copilot/readiness
  └─ splitStrongWeakAreas(doc)
     ├── Sort focusAreas by progress
     ├── strongAreas = areas with progress >= 75
     └── weakAreas = areas with progress < 65
  └─ generateReadinessRecommendation(doc)
     └── Based on weak areas + target company
  └─ Returns: overallScore, strongAreas, weakAreas, recommendation, companyTarget, estimatedMonths
```

---

## 8. API Endpoint Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Create account (name, email, password) → JWT |
| POST | /login | No | Login (email, password) → JWT |
| GET | /profile | Yes | Get authenticated user's profile |

### User (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /add-xp | Yes | Add XP → recalculate level |

### Profile (`/api/profile`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | No | Create profile (college, skills, links, etc.) |
| GET | /:userId | No | Get profile by userId |

### Resume (`/api/resume`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /upload | Yes | Upload resume file (no analysis) |
| POST | /analyze | Yes | Upload + analyze OR provide resumeId |
| GET | /history/:userId | Yes | Paginated history |
| GET | /latest/:userId | Yes | Latest analyzed resume |
| DELETE | /:id | Yes | Delete analysis + file |

### ATS (`/api/ats`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /check | No | Generate mock ATS report |
| GET | /:userId | No | Get ATS report |

### GitHub (`/api/github`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /analyze | No | Generate mock GitHub analysis |
| GET | /:userId | No | Get GitHub report |

### LeetCode (`/api/leetcode`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /analyze | No | Generate mock LeetCode analysis |
| GET | /:userId | No | Get LeetCode report |

### DSA Tracker (`/api/dsa`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /update-progress | Yes | Record solved problem |
| GET | /dashboard | Yes | Full dashboard payload |
| GET | /topics | Yes | Topic breakdown |
| GET | /heatmap | Yes | 90-day activity |
| GET | /suggestions | Yes | AI-picked problems |
| POST | /add-problem | Yes | Bookmark a problem |
| POST | /update-streak | Yes | Manually update streak |

### Mock Interview (`/api/mock`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /start | Yes | Start interview (type, difficulty) |
| GET | /history | Yes | Paginated list |
| GET | /:interviewId | Yes | Get current interview |
| POST | /:interviewId/answer | Yes | Submit answer |
| POST | /:interviewId/end | Yes | End & generate report |
| GET | /:interviewId/report | Yes | Get report |
| DELETE | /:interviewId | Yes | Delete interview |

### Career Copilot (`/api/copilot`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dashboard | Yes | Dashboard data |
| GET | /chat | Yes | Chat history |
| POST | /chat | Yes | Send message, get AI response |
| POST | /generate-plan | Yes | Generate 30-day plan for company |
| POST | /update-goal | Yes | Toggle weekly goal |
| GET | /readiness | Yes | Readiness analysis |

### Roadmap (`/api/roadmap`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /create | No | Create 3-month roadmap (hardcoded Amazon template) |
| GET | /:userId | No | Get roadmap |

### Weekly Plan (`/api/weekly-plan`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /create | No | Create weekly plan (hardcoded Mon-Sun) |
| GET | /:userId | No | Get weekly plan |

### Internship (`/api/internship`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /seed | No | Insert 5 sample internship applications |
| GET | /:userId | No | Get internships with status counts |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check (status, timestamp) |
