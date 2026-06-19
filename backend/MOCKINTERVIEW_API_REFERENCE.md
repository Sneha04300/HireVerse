# AI Mock Interview — Sample Document & API Reference

## Sample MongoDB Document (completed interview)

```json
{
  "_id": "665f9a1b2c3d4e5f6a7b8c9d",
  "userId": "665e0a1b2c3d4e5f6a7b8c9d",
  "type": "Technical",
  "difficulty": "Medium",
  "status": "completed",
  "startedAt": "2026-06-19T10:00:00.000Z",
  "endedAt": "2026-06-19T10:14:32.000Z",
  "duration": 872,
  "currentQuestionIndex": 5,
  "questions": [
    {
      "question": "Tell me about yourself.",
      "answer": "I'm a final-year CSE student with experience in the MERN stack. I built HireVerse, a placement platform, where I reduced page load time by 38% through code-splitting.",
      "score": 82
    },
    {
      "question": "Walk me through how you would design a URL shortening service.",
      "answer": "I would use a base62 encoding scheme with a distributed key generation service...",
      "score": 75
    }
  ],
  "transcript": [
    { "speaker": "AI",   "text": "Tell me about yourself.", "timestamp": "2026-06-19T10:00:00.000Z" },
    { "speaker": "User", "text": "I'm a final-year CSE student...", "timestamp": "2026-06-19T10:01:12.000Z" },
    { "speaker": "AI",   "text": "Walk me through how you would design a URL shortening service.", "timestamp": "2026-06-19T10:01:13.000Z" }
  ],
  "report": {
    "overallScore": 78,
    "communication": 72,
    "confidence": 81,
    "technical": 79,
    "problemSolving": 80,
    "feedback": [
      "Speak more confidently in the first 30 seconds - lead with a strong opening line.",
      "Add measurable impact while explaining projects - numbers make answers memorable.",
      "Structure answers using the STAR method (Situation, Task, Action, Result)."
    ],
    "verdict": "Likely Shortlist"
  },
  "createdAt": "2026-06-19T10:00:00.000Z",
  "updatedAt": "2026-06-19T10:14:32.000Z"
}
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST   | `/api/mock/start` | Yes | Create a new interview, returns first question |
| GET    | `/api/mock/history` | Yes | All previous interviews, paginated |
| GET    | `/api/mock/:interviewId` | Yes | Current question, transcript, elapsed time, status |
| POST   | `/api/mock/:interviewId/answer` | Yes | Submit an answer, advance to next question |
| POST   | `/api/mock/:interviewId/end` | Yes | Finalize interview, calculate report |
| GET    | `/api/mock/:interviewId/report` | Yes | Fetch the final report |
| DELETE | `/api/mock/:interviewId` | Yes | Delete an interview |

### POST /api/mock/start — Response

```json
{
  "success": true,
  "message": "Interview started successfully.",
  "data": {
    "interviewId": "665f9a1b2c3d4e5f6a7b8c9d",
    "currentQuestion": "Tell me about yourself.",
    "totalQuestions": 6,
    "status": "in_progress"
  }
}
```

### POST /api/mock/:interviewId/answer — Response

```json
{
  "success": true,
  "message": "Answer submitted successfully.",
  "data": {
    "interviewId": "665f9a1b2c3d4e5f6a7b8c9d",
    "nextQuestion": "Walk me through how you would design a URL shortening service.",
    "currentQuestionIndex": 1,
    "totalQuestions": 6,
    "isLastQuestion": false,
    "status": "in_progress"
  }
}
```

When the last question is answered, `nextQuestion` is `null` and `isLastQuestion` is `true` — this is the frontend's signal to call `/end`.

### GET /api/mock/:interviewId/report — Response

```json
{
  "success": true,
  "data": {
    "overallScore": 78,
    "communication": 72,
    "confidence": 81,
    "technical": 79,
    "problemSolving": 80,
    "feedback": [
      "Speak more confidently in the first 30 seconds - lead with a strong opening line.",
      "Add measurable impact while explaining projects - numbers make answers memorable.",
      "Structure answers using the STAR method (Situation, Task, Action, Result)."
    ],
    "verdict": "Likely Shortlist"
  }
}
```

---

## Business Logic Summary

**Question selection** — "Tell me about yourself" always leads; the remaining 5 are shuffled from the type+difficulty bank to avoid repeats across sessions.

**Per-answer scoring** — heuristic based on word count (40-180 words is ideal), presence of numbers (quantified impact), STAR-method language, and filler-word penalty. This is a placeholder; swap `scoreAnswer()` in `mockInterviewService.js` for a real LLM-based grader when ready (e.g. call your AI API with the question+answer and ask for a 0-100 score).

**Aggregate scoring** — the 4 report metrics (communication, confidence, technical, problemSolving) are derived from the average per-answer score with a small deterministic per-interview variance so they don't all show identical numbers. HR interviews get a technical-score penalty since technical depth isn't the focus.

**Verdict thresholds**:
- `>= 85` → Strong Hire
- `>= 70` → Likely Shortlist
- `>= 55` → Average Candidate
- `< 55`  → Needs Improvement

**Route ordering note** — `/history` is registered before `/:interviewId` in `mockInterviewRoutes.js`. If reversed, Express would treat the literal string `"history"` as an `interviewId`, causing a Mongoose `CastError` when querying by `_id`.

---

## Frontend Integration — matching MockInterviewPage.jsx

Replace the dummy data imports with real API calls. Suggested `services/mockInterviewApi.js`:

```js
// src/services/mockInterviewApi.js
const BASE = "/api/mock";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const startInterview = (type, difficulty) =>
  fetch(`${BASE}/start`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ type, difficulty }),
  }).then((r) => r.json());

export const getInterview = (interviewId) =>
  fetch(`${BASE}/${interviewId}`, { headers: authHeaders() }).then((r) => r.json());

export const submitAnswer = (interviewId, answer) =>
  fetch(`${BASE}/${interviewId}/answer`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ answer }),
  }).then((r) => r.json());

export const endInterview = (interviewId) =>
  fetch(`${BASE}/${interviewId}/end`, {
    method: "POST",
    headers: authHeaders(),
  }).then((r) => r.json());

export const getReport = (interviewId) =>
  fetch(`${BASE}/${interviewId}/report`, { headers: authHeaders() }).then((r) => r.json());

export const getHistory = (page = 1, limit = 10) =>
  fetch(`${BASE}/history?page=${page}&limit=${limit}`, { headers: authHeaders() }).then((r) => r.json());

export const deleteInterview = (interviewId) =>
  fetch(`${BASE}/${interviewId}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json());
```

How this maps onto your `MockInterviewPage.jsx` state machine:

```js
// handleStart — replace the local setElapsed/setState only:
const handleStart = async (type, difficulty) => {
  const res = await startInterview(type, difficulty);
  if (!res.success) return; // show error toast
  setInterviewId(res.data.interviewId);
  setCurrentQuestion(res.data.currentQuestion);
  setTotalQuestions(res.data.totalQuestions);
  setElapsed(0);
  setState(STATES.INTERVIEW);
};

// InterviewPanel's submit handler (wherever the user submits their spoken/typed answer):
const handleSubmitAnswer = async (answerText) => {
  const res = await submitAnswer(interviewId, answerText);
  if (!res.success) return;

  if (res.data.isLastQuestion) {
    await handleEnd(); // triggers /end automatically
  } else {
    setCurrentQuestion(res.data.nextQuestion);
  }
};

// handleEnd — replace local setState(STATES.COMPLETED) with a real call:
const handleEnd = async () => {
  const res = await endInterview(interviewId);
  if (!res.success) return;
  setReportData(res.data.report);
  setState(STATES.COMPLETED);
};
```

`LiveTranscript`'s transcript prop can be populated by polling `GET /api/mock/:interviewId` after each answer, or by appending locally (AI question + user answer) right after each `submitAnswer` call — the backend already stores the full transcript server-side either way, so a full re-fetch is safe and simple.
