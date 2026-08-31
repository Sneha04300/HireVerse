# COMPLETE MOCK INTERVIEW FLOW — TECHNICAL REPORT

---

## 1. FRONTEND FLOW

### Main Component
**File:** `frontend/src/pages/MockInterviewPage.jsx` (line 25)
- `MockInterviewPage` is the main component. It manages all interview state including `state`, `interviewId`, `currentQuestion`, `currentQuestionIndex`, `transcriptLines`, `isProcessing`, `error`, `transcriptReady`, etc.

### InterviewSetup Component
**File:** `frontend/src/components/interview/InterviewSetup.jsx` (line 7)
- Renders type/difficulty selector buttons and the "Start Interview" button.
- When "Start Interview" is clicked (line 96), `handleStartInterview()` calls `onStart({ type: selectedType, difficulty: selectedDifficulty })`.
- `onStart` is the `handleStart` callback from `MockInterviewPage`.

### Service / API Call
**File:** `frontend/src/services/mockInterviewService.js` (lines 5-8)
```js
export const startInterview = async (type, difficulty) => {
  const response = await api.post("/mock/start", { type, difficulty });
  return unwrap(response);
};
```
**File:** `frontend/src/services/api.js` (lines 3-5)
- Axios instance with `baseURL: "http://localhost:3001/api"`.
- **Auth interceptor** (line 7-21): reads `token` from `localStorage.getItem("token")` and sets `config.headers.Authorization = "Bearer ${token}"`.

**Exact API request sent:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/mock/start`
- **Body:** `{ type, difficulty }` (e.g., `{ type: "Technical", difficulty: "Medium" }`)
- **Headers:** `Authorization: Bearer <token>` (from localStorage)

### Response Handling
**File:** `frontend/src/services/mockInterviewService.js` line 3
- `unwrap(response)` returns `response.data.data ?? response.data`.
- The backend sends `{ success: true, message: "...", data: { interviewId, question, questionNumber, audioUrl } }`, so `unwrap` extracts the `data` object.

### State Storage (handleStart, lines 62-102 of MockInterviewPage.jsx)
After `startInterview` resolves:
- `interviewId` ← `data.interviewId`
- `currentQuestion` ← `data.question`
- `currentQuestionIndex` ← `data.questionNumber - 1`
- `totalQuestions` ← `6`
- `transcriptLines` ← `[{ speaker: "AI", text: question }]`
- `elapsed` ← `0`
- `transcriptReady` ← `false`
- `report` ← `null`
- `state` ← `STATES.INTERVIEW`
- `isProcessing` ← `false`

If `audioUrl` is present, it auto-plays the audio.

### First Question Display
- `InterviewPanel` receives `question={currentQuestion ? \`"${currentQuestion}"\` : null}` and renders it.
- `LiveTranscript` displays `transcriptLines` (which includes the AI question) and shows the question number.

### Moving to Second/Subsequent Question (handleSubmitAnswer, lines 104-150)
- `handleSubmitAnswer(answer)` calls `mockInterviewService.submitAnswer(interviewId, answer)`.
- On success, if `data.nextQuestion` exists:
  - `setCurrentQuestion(data.nextQuestion)` — updates displayed question
  - `setCurrentQuestionIndex(data.nextQuestionNumber - 1)`
  - Appends AI question to `transcriptLines`
- The `LiveTranscript` useEffect (line 78-88) fires when `questionNum` changes, resetting `setAnswer(speechText || "")`.

### Duplicate Request Risk on Start
**YES — `handleStart` has NO duplicate guard.** Lines 62-102 show no `if (isProcessing) return` check. If the user clicks "Start" twice before the first request completes, two `POST /mock/start` requests fire simultaneously. `setIsProcessing(true)` is called synchronously, but React may batch state updates, so `isProcessing` may not yet be `true` when the second click triggers another `handleStart` call.

### Loading States & State Variables
- **`isProcessing`**: Set `true` at start of `handleStart` and `handleSubmitAnswer`, set `false` on completion or error. Controls the loading spinner on the submit button (`loading={isLoading}` where `isLoading = isProcessing`).
- **`pageState` (`state`)**: One of `"empty"`, `"interview"`, `"completed"` (from `InterviewStates.jsx`). Controls which UI sections render.
- **`questionNum`**: Passed to `LiveTranscript` as `state === STATES.INTERVIEW ? currentQuestionIndex + 1 : 1`.
- **`speechText`**: From `recorder.transcript` (audio transcription result).
- **`recordingState`**: From `useAudioRecorder`, values: `"idle"`, `"recording"`, `"transcribing"`, `"ready"`.
- **`transcriptReady`**: Set `true` when `recorder.recordingState === "ready" && recorder.transcript` is truthy (line 57-59 useEffect).

### useEffect Hooks — Duplicate Request Analysis
**MockInterviewPage.jsx:**
- **Line 47-54**: Timer effect on `state`. Only starts/stops a setInterval. No API calls. No duplicate request risk.
- **Line 56-60**: Transcript-ready effect on `recorder.recordingState` and `recorder.transcript`. No API calls. No duplicate request risk.
- **Line 43-45**: Empty cleanup effect. No-op.

**LiveTranscript.jsx:**
- **Line 78-88** (`useEffect` on `[pageState, questionNum]`): Sets `answer` from `speechText`. No API calls.
- **Line 90-97** (`useEffect` on `[speechText, pageState]`): Sets `answer` if `speechText` is present. No API calls.
- **No useEffect triggers any API request.**

**Conclusion:** No useEffect hook can trigger duplicate requests. The only duplicate-request risk is the unguarded `handleStart` double-click.

---

## 2. BACKEND ROUTE

### Route Definition
**File:** `backend/src/routes/mockInterviewRoutes.js` line 29:
```js
router.post("/start", protect, startInterview);
```

### Auth Middleware
**File:** `backend/src/middleware/authMiddleware.js`
- `protect` reads token from `Authorization: Bearer <token>` header or `req.cookies.token`.
- Verifies JWT with `process.env.JWT_SECRET`.
- Attaches `req.user` (the user document, minus password).
- Returns 401 if no token, invalid token, or expired token.

### Controller
**File:** `backend/src/controllers/mockInterviewController.js` lines 18-66:

**Complete flow:**
1. Extract `{ type, difficulty }` from `req.body` (line 20).
2. **Validation:**
   - Both `type` and `difficulty` required (line 22-24).
   - `type` must be in `MockInterview.INTERVIEW_TYPES` = `["Technical", "HR", "Mixed"]` (line 25-30).
   - `difficulty` must be in `MockInterview.DIFFICULTY_LEVELS` = `["Easy", "Medium", "Hard"]` (line 31-36).
3. Call `mockInterviewService.startInterview(req.user._id, { type, difficulty })` (line 38) — this creates the DB document and calls Groq.
4. Extract `question = doc.questions[0].question` (line 39).
5. Call `piperService.generateSpeech(question)` to generate audio (lines 44-50). Failure is caught silently (audioUrl stays null).
6. Return `201` with body:
```json
{
  "success": true,
  "message": "Interview started successfully.",
  "data": {
    "interviewId": "<doc._id>",
    "question": "<groq_question>",
    "questionNumber": 1,
    "audioUrl": "<piper_url or null>"
  }
}
```
7. **Error catch** (line 62-65): Logs `"[Groq] Error: <err.message>"` and returns `500` with `{ success: false, message: "Failed to start interview.", error: err.message }`.

### All Functions Called During startInterview
1. `mockInterviewService.startInterview(userId, { type, difficulty })` — line 38
   - Internally calls `groqService.generateInterviewQuestion(type, difficulty)` — line 12
   - Then calls `MockInterview.create(...)` — line 14
2. `piperService.generateSpeech(question)` — line 45
3. `res.status(201).json(...)` — line 52

---

## 3. GROQ INTEGRATION

### File & Function
**File:** `backend/src/services/groqService.js` lines 10-33

### Exact Groq API Call
```js
const response = await client.chat.completions.create({
  model: LLM_MODEL,           // "openai/gpt-oss-120b"
  messages: [
    { role: "system", content: system },
    { role: "user", content: user },
  ],
  max_tokens: 150,
  temperature: 0.7,
});
```

### Model
**`"openai/gpt-oss-120b"`** (line 4)

### System Prompt (from `buildInterviewPrompt`)
**File:** `backend/src/prompts/interviewPrompts.js` lines 10-23:
```
You are a Senior Technical Interviewer.

Your job is to conduct a realistic interview.

Rules:
- Ask ONLY ONE interview question.
- Never answer it.
- Never number the question.
- Never add explanation.
- Never greet.
- Keep it below 35 words.
- Match the requested difficulty.
- Match the requested interview type.
- Do NOT repeat or rephrase any previously asked question. (only if previousQuestions > 0)
- Question should feel natural and professional.
```

### User Prompt
```
Interview Type: <type>
Difficulty: <difficulty>

Previously asked questions:
1. <q1>
2. <q2>
...

Ask a completely different question that has not been asked.

Return only the interview question.
```
(The `previousQuestions` section is appended only when `previousQuestions.length > 0`.)

### Response Format Expected
The code expects **plain text** (NOT JSON). It does NOT attempt JSON parsing for questions. It simply takes the raw text content.

### Response Parsing
**File:** `groqService.js` lines 28-29:
```js
const question = response.choices[0]?.message?.content?.trim();
if (!question) throw new Error("Groq returned an empty question response.");
```
- Extracts `content` from the first choice's message.
- Calls `.trim()`.
- If the result is falsy (empty string, undefined, null), throws the error.

### What Happens for Each Response Type

| Groq Response | Result |
|---|---|
| **Normal text** (e.g., `"Explain recursion."`) | `trim()` succeeds, question is returned normally. |
| **JSON** (e.g., `{"q": "..."}`) | `trim()` returns the JSON string, it's used as-is — the JSON is NOT parsed. This could produce a malformed question. |
| **Empty content** (`""`) | `"".trim()` → `""`, `!""` is `true` → **throws "Groq returned an empty question response."** |
| **Whitespace only** (`"   "`) | `"   ".trim()` → `""`, `!""` is `true` → **throws the error.** |
| **null/undefined content** | `undefined?.trim()` → `undefined`, `!undefined` is `true` → **throws the error.** |
| **API error** (network, rate limit, etc.) | Throws before reaching line 29, caught by controller's try-catch, logged as `"[Groq] Error: <message>"`. |

### Retry Logic Around Groq for Question Generation
**There is NONE.** `generateInterviewQuestion` has zero retry logic. If it fails, the error propagates immediately.

The only retry function is `evaluateWithRetry` (line 39-53 of `mockInterviewService.js`), which retries `evaluateSingleAnswer` (NOT `generateInterviewQuestion`). Default `retries = 1`, meaning 2 total attempts for evaluation only.

### Can One Frontend Request Cause Multiple Groq Requests?
- **For `startInterview`**: Exactly 1 Groq call (`generateInterviewQuestion`). No retries on question generation.
- **For `submitAnswer`**: Up to **2 Groq calls** — one from `evaluateWithRetry` (for answer evaluation) + one from `generateInterviewQuestion` (for the next question). The evaluation call may retry once more (2 attempts), so worst case 3 Groq calls per `submitAnswer`.

---

## 4. RESPONSE STRUCTURE

### For `POST /api/mock/start` (line 52-61 of controller)
```json
{
  "success": true,
  "message": "Interview started successfully.",
  "data": {
    "interviewId": "<MongoDB ObjectId>",
    "question": "<the Groq-generated question text>",
    "questionNumber": 1,
    "audioUrl": "<URL from Piper TTS, or null if Piper failed>"
  }
}
```

After `unwrap()` in the frontend service, the returned object is:
```js
{ interviewId, question, questionNumber, audioUrl }
```

---

## 5. SECOND REQUEST / REPEATED REQUEST BEHAVIOR — ROOT CAUSE ANALYSIS

### Exact Error
**File:** `backend/src/services/groqService.js` line 29:
```js
if (!question) throw new Error("Groq returned an empty question response.");
```

This is caught by `mockInterviewController.js` line 63:
```js
console.error("[Groq] Error:", err.message);
```
and returned as `500` with `error: "Groq returned an empty question response."`.

### Why First Request Works But Second Fails

**Key difference between first and subsequent Groq calls:**

1. **First call (`startInterview`):** Calls `generateInterviewQuestion(type, difficulty)` with `previousQuestions = []` (default). The prompt has NO "previously asked questions" context.

2. **Second call (`submitAnswer` → `generateInterviewQuestion`):** Calls `generateInterviewQuestion(doc.type, doc.difficulty, previousQuestions)` where `previousQuestions` is built at line 134-136 of `mockInterviewService.js`:
   ```js
   const previousQuestions = doc.questions
     .filter((q) => q.question)
     .map((q) => q.question);
   ```
   This passes ALL previously asked questions to Groq. The prompt now includes:
   ```
   Previously asked questions:
   1. <first question>

   Ask a completely different question that has not been asked.
   ```

   **If Groq returns empty content, whitespace, or fails to produce a non-repeating question, the error triggers.**

3. **No retry on `generateInterviewQuestion`.** Unlike `evaluateWithRetry`, there is NO retry loop around `generateInterviewQuestion`. A single failure = a single failure.

### Specific Factors That Can Cause Empty Question on Second+ Request

| Factor | Details |
|---|---|
| **Groq rate limiting** | Rapid successive requests (first starts, then immediately submits answer → generates next question) may hit Groq's rate limits, causing empty responses or errors. |
| **Prompt complexity** | The `previousQuestions` context grows with each question. Longer prompts may cause Groq to produce empty/degenerate responses. |
| **`previousQuestions` filter** | Line 135: `.filter((q) => q.question)` — if any question has a falsy `question` field, it's excluded. This is correct but means the context could be incomplete if data is corrupted. |
| **No debouncing/guarding on `handleSubmitAnswer`** | While `loading` disables the submit button, `handleStart` has NO such guard. Double-clicking "Start" sends two `POST /mock/start` requests simultaneously — the second one may fail because both hit Groq at nearly the same time. |
| **`handleStart` no `isProcessing` guard** | `handleStart` (line 62) does NOT check `if (isProcessing) return;`. If `setIsProcessing(true)` hasn't caused a re-render before the second click, a second request fires. |
| **Stale state in `handleSubmitAnswer`** | `handleSubmitAnswer` depends on `[interviewId, recorder]`. If `interviewId` is somehow null or stale, the function returns early (`if (!answer.trim() || !interviewId) return;`). |
| **`evaluateWithRetry` consumes tokens** | The `submitAnswer` flow first calls `evaluateSingleAnswer` (which may retry once), consuming Groq tokens/rate limits BEFORE calling `generateInterviewQuestion`. This increases the chance that `generateInterviewQuestion` gets rate-limited or returns empty. |

### Conversation/History Arrays
- **Backend `MockInterview` model:** `doc.questions` array stores all questions. `doc.currentQuestionIndex` tracks position. `doc.transcript` stores transcript lines.
- **Frontend `transcriptLines`** state: Array of `{ speaker, text }` objects. Appended to on each submit.
- **Frontend `currentQuestion`** state: Holds the current question string. Updated on `handleSubmitAnswer` success.

### State Reset
- `handleRetake` (line 152) resets all state to initial values and sets `state = STATES.EMPTY`.
- `handleStart` does NOT reset `currentQuestionIndex` or `totalQuestions` to 0/6 — it explicitly sets them from the response (`questionNumber - 1` and hardcoded `6`).

### Duplicate API Requests
- **`handleStart`**: No guard. Double-click can fire 2+ `POST /mock/start` requests.
- **`handleSubmitAnswer`**: Protected by `loading`/`isProcessing` flag on the button, but no programmatic guard inside the function itself.

### Asynchronous State Updates & Stale React State
- `handleStart` and `handleSubmitAnswer` are wrapped in `useCallback` with dependencies `[]` and `[interviewId, recorder]` respectively.
- `handleStart`'s dependency array is `[]`, meaning the function is stable and never recreated. This is fine but means `isProcessing` is read from the current render's state, not captured in the closure.
- The `setIsProcessing(true)` → `await` → `setIsProcessing(false)` pattern means during the await, the button should be disabled (if properly wired), but `handleStart` itself doesn't check `isProcessing`.

### Empty/Null Values Passed to Groq
- `generateInterviewQuestion(type, difficulty, previousQuestions)` always receives a string `type` and `difficulty` (validated by the controller). `previousQuestions` defaults to `[]`.
- If `type` or `difficulty` were somehow empty strings, they'd pass validation (the controller checks truthiness, not emptiness of strings — but the enum check would catch invalid values).

---

## 6. EXACT FILES AND LINES — KEY FINDINGS

| Finding | File | Function/Component | Lines | Explanation |
|---|---|---|---|---|
| Main page | `frontend/src/pages/MockInterviewPage.jsx` | `MockInterviewPage` | 25-262 | Main interview component |
| Start handler | `frontend/src/pages/MockInterviewPage.jsx` | `handleStart` | 62-102 | No duplicate guard, no `isProcessing` check |
| Submit handler | `frontend/src/pages/MockInterviewPage.jsx` | `handleSubmitAnswer` | 104-150 | Guarded by `loading` on button only |
| Start service | `frontend/src/services/mockInterviewService.js` | `startInterview` | 5-8 | `api.post("/mock/start", { type, difficulty })` |
| Submit service | `frontend/src/services/mockInterviewService.js` | `submitAnswer` | 15-18 | `api.post(\`/mock/${interviewId}/answer\`, { answer })` |
| API client | `frontend/src/services/api.js` | axios instance | 3-5 | Base URL `http://localhost:3001/api`, Bearer token interceptor |
| Route | `backend/src/routes/mockInterviewRoutes.js` | `router.post("/start", ...)` | 29 | `protect` middleware + `startInterview` controller |
| Controller | `backend/src/controllers/mockInterviewController.js` | `startInterview` | 18-66 | Validates type/difficulty, calls service, returns 201 with data |
| Service | `backend/src/services/mockInterviewService.js` | `startInterview` | 11-37 | Calls `groqService.generateInterviewQuestion`, creates DB doc |
| Groq function | `backend/src/services/groqService.js` | `generateInterviewQuestion` | 10-33 | Calls Groq API, parses response, throws on empty |
| Error throw | `backend/src/services/groqService.js` | line 29 | `if (!question) throw new Error("Groq returned an empty question response.")` | The exact error line |
| Model | `backend/src/models/MockInterview.js` | schema | 70-97 | Questions, transcript, report sub-schemas |
| Prompts | `backend/src/prompts/interviewPrompts.js` | `buildInterviewPrompt` | 1-29 | Builds system/user prompts, adds previousQuestions context only when `length > 0` |
| Evaluation retry | `backend/src/services/mockInterviewService.js` | `evaluateWithRetry` | 39-53 | Only retries evaluation, NOT question generation. Default 1 retry = 2 attempts. |
| InterviewSetup | `frontend/src/components/interview/InterviewSetup.jsx` | `handleStartInterview` | 12-17 | Passes `{ type, difficulty }` to `onStart` |
| States | `frontend/src/components/interview/InterviewStates.jsx` | `STATES` | 1-5 | `{ EMPTY: "empty", INTERVIEW: "interview", COMPLETED: "completed" }` |
| Auth middleware | `backend/src/middleware/authMiddleware.js` | `protect` | 12-42 | JWT verification from header or cookie |

---

## 7. FINAL FLOW

### START INTERVIEW (First Question)

```
Start Interview button clicked
→ InterviewSetup.handleStartInterview() [InterviewSetup.jsx:12]
→ MockInterviewPage.handleStart({ type, difficulty }) [MockInterviewPage.jsx:62]
→ mockInterviewService.startInterview(type, difficulty) [mockInterviewService.js:5]
→ api.post("/mock/start", { type, difficulty }) [api.js:3]
→ POST http://localhost:3001/api/mock/start
   Headers: { Authorization: "Bearer <token>" }
   Body: { type, difficulty }
→ protect middleware [authMiddleware.js:12] — validates JWT
→ startInterview controller [mockInterviewController.js:18]
   → validates type, difficulty [lines 22-36]
   → mockInterviewService.startInterview(userId, { type, difficulty }) [line 38]
      → groqService.generateInterviewQuestion(type, difficulty, []) [groqService.js:10]
         → buildInterviewPrompt(type, difficulty, []) [interviewPrompts.js:1]
         → client.chat.completions.create({ model: "openai/gpt-oss-120b", ... }) [groqService.js:18]
         → response.choices[0]?.message?.content?.trim() [groqService.js:28]
         → if (!question) throw "Groq returned an empty question response." [groqService.js:29]
      → MockInterview.create({ questions: [{ number: 1, question: questionText }] }) [mockInterviewService.js:14]
   → piperService.generateSpeech(question) [controller.js:45]
   → res.status(201).json({ success, message, data: { interviewId, question, questionNumber: 1, audioUrl } }) [controller.js:52]
→ unwrap(response) [mockInterviewService.js:3] → { interviewId, question, questionNumber, audioUrl }
→ handleStart sets state [MockInterviewPage.jsx:67-81]
   → setCurrentQuestion(question)
   → setCurrentQuestionIndex(0)
   → setTranscriptLines([{ speaker: "AI", text: question }])
   → setState(STATES.INTERVIEW)
→ InterviewPanel displays question [InterviewPanel.jsx:35]
→ LiveTranscript displays transcript with the question [LiveTranscript.jsx:125]
```

### SUBMIT ANSWER → SECOND QUESTION

```
User submits answer
→ LiveTranscript.handleSubmit() [LiveTranscript.jsx:99]
→ MockInterviewPage.handleSubmitAnswer(answer) [MockInterviewPage.jsx:104]
→ mockInterviewService.submitAnswer(interviewId, answer) [mockInterviewService.js:15]
→ api.post(`/mock/${interviewId}/answer`, { answer }) [api.js:3]
→ protect middleware [authMiddleware.js]
→ submitAnswer controller [mockInterviewController.js:101]
   → validates answer [line 106]
   → findOwnedInterview(interviewId, userId) [line 110]
   → mockInterviewService.submitAnswer(doc, answer) [line 117]
      → evaluateWithRetry(q.question, answer, type, difficulty) [mockInterviewService.js:121]
         → groqService.evaluateSingleAnswer(question, answer, type, difficulty) [groqService.js:76]
            → May retry once (2 total attempts) [mockInterviewService.js:39-53]
      → groqService.generateInterviewQuestion(type, difficulty, previousQuestions) [mockInterviewService.js:138]
         → previousQuestions = doc.questions.filter(q => q.question).map(q => q.question) [line 134-136]
         → buildInterviewPrompt(type, difficulty, previousQuestions) [interviewPrompts.js:1]
            → Adds "Previously asked questions:" context to user prompt [interviewPrompts.js:5-7]
         → client.chat.completions.create({ model: "openai/gpt-oss-120b", ... }) [groqService.js:18]
         → response.choices[0]?.message?.content?.trim() [groqService.js:28]
         → if (!question) throw "Groq returned an empty question response." [groqService.js:29]
            ⚠ THIS IS WHERE THE SECOND REQUEST CAN FAIL
      → doc.questions.push({ number: nextNum, question: nextQuestion }) [mockInterviewService.js:141]
   → piperService.generateSpeech(nextQuestion) [controller.js:122]
   → res.status(200).json({ success, data: { nextQuestion, nextQuestionNumber, audioUrl, report } }) [controller.js:130]
→ handleSubmitAnswer sets state [MockInterviewPage.jsx:128-130]
   → setCurrentQuestion(data.nextQuestion)
   → setCurrentQuestionIndex(data.nextQuestionNumber - 1)
→ InterviewPanel displays new question
→ LiveTranscript shows updated transcript
```

### WHY SECOND REQUEST FAILS — SUMMARY

The exact line that produces the error is **`backend/src/services/groqService.js:29`**:
```js
if (!question) throw new Error("Groq returned an empty question response.");
```

This is caught by `mockInterviewController.js` line 63:
```js
console.error("[Groq] Error:", err.message);
```
and returned as `500` with `error: "Groq returned an empty question response."`.

The first `startInterview` call passes `previousQuestions = []` (empty), so Groq receives a simple prompt. The second call (from `submitAnswer`) passes `previousQuestions` containing the first question, making the prompt longer and adding the constraint "Do NOT repeat or rephrase any previously asked question." Groq may return empty/whitespace content under these conditions, especially under rate limiting or when it cannot generate a sufficiently different question. There is **no retry logic** around `generateInterviewQuestion`, so any failure is immediate and fatal.
