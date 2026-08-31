### HireVerse — AI-Powered Placement Preparation Platform

A full-stack AI-powered placement preparation platform that helps students prepare for technical interviews through Resume Analysis, ATS Score Checking, DSA Tracking, AI Mock Interviews, Career Roadmaps, and an AI Career Copilot.

### Features
 Secure Authentication (JWT + Bcrypt)
 AI Resume Analyzer
 ATS Resume Score Checker
 DSA Progress Tracker
 AI Mock Interview (Groq Llama 3.3)
 Voice-based Interview using Piper TTS & Groq Whisper
 Live Speech-to-Text Transcription
 AI Interview Report & Performance Analytics
 Career Roadmap Generator
 AI Career Copilot
 Dashboard with Placement Progress

## Project Structure

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

### Modules

Authentication
Dashboard
Resume Analyzer
ATS Score Checker
DSA Tracker
AI Mock Interview
Career Copilot
Career Roadmap

### AI Mock Interview Workflow
User selects interview type and difficulty.
Groq Llama generates interview questions.
Piper converts questions into natural speech.
User records their answer.
Groq Whisper converts speech to text.
User reviews or edits the transcript.
AI evaluates the response.
Final interview report is generated.

### Installation
git clone https://github.com/Sneha04300/HireVerse.git
cd HireVerse
### Backend
cd backend
npm install
npm run dev
### Frontend
cd frontend
npm install
npm run dev

### Environment Variables

Create a .env file inside the backend folder.

PORT=3001

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

GROQ_API_KEY=your_groq_api_key

PIPER_PATH=your_piper_executable

PIPER_MODEL=your_voice_model

### Current Progress
✅ Authentication
✅ Resume Analyzer
✅ ATS Score Checker
✅ DSA Tracker
✅ AI Mock Interview (Voice + Speech-to-Text)
🚧 Career Copilot
🚧 Career Roadmap
🚧 Placement Dashboard Improvements


### License
This project is developed for educational purposes.

### API Endpoint Summary

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

### Author

Sneha Gupta

B.Tech Computer Science Engineering
BML Munjal University

GitHub: https://github.com/Sneha04300




