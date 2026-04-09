# DebugMate

## The Problem
I built DebugMate because I kept wasting time when my JavaScript and Node.js code failed with unclear error messages. I would copy the stack trace, search multiple tabs, test random fixes, and still not know the real root cause. I wanted one place where I could paste my failing code and the error log and immediately get a structured explanation of what broke, why it broke, and what to try next. This problem is common for beginner and intermediate developers who lose time moving between their editor, browser, docs, and forums just to understand one failure.

## What It Does
DebugMate lets the user paste a failing JavaScript/Node.js code snippet, paste the error output, and optionally describe the expected behavior. The app sends that information to the backend, where an AI model analyzes the bug and returns a structured debugging response. The user gets a clearer explanation of the likely cause, possible fixes, and next steps, instead of manually piecing together clues from stack traces.

## AI Integration
**API:** OpenRouter  
**Model:** openai/gpt-4o-mini  
**Location:** `backend/server.js` → `[your actual function name]`  
**What the AI does:** It analyzes the code snippet and error log, identifies likely causes, and returns a developer-friendly debugging explanation with suggested fixes.

## What I Intentionally Excluded
- **No user authentication** — I wanted to ship the core debugging workflow first. Login would add extra backend and frontend complexity without improving the main value of the product.
- **No saved debug history in a database** — for this version, fast analysis mattered more than persistence. I kept the product stateless so I could focus on accurate AI responses and deployment.
- **No multi-language support** — I limited the product to JavaScript/Node.js so the prompt quality and debugging experience would stay focused and reliable.

## Monthly Cost Calculation
Model: openai/gpt-4o-mini  
Input: $0.15 per 1M tokens  
Output: $0.60 per 1M tokens  

Avg tokens per call: ~900 input + ~500 output  

Cost per call:  
(900 / 1,000,000 × $0.15) + (500 / 1,000,000 × $0.60)  
= $0.000135 + $0.000300  
= $0.000435

Expected monthly calls: 300  

Monthly total:  
300 × $0.000435 = $0.1305  
≈ **$0.13/month**

> Replace the token numbers and expected monthly calls if your actual prompt/response size is different.

## Live Deployment
**Frontend:** [your frontend URL]  
**Backend:** https://debugmate-br7x.onrender.com

## Tech Stack
- Frontend: [React / Vite / Tailwind / etc.]
- Backend: Node.js, Express
- AI: OpenRouter + openai/gpt-4o-mini

## How to Run Locally

### Backend
```bash
cd backend
npm install
npm start