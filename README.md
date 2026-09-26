<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" width="60" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="60" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Python-Dark.svg" width="60" />
  
  <br/><br/>
  
  <h1>🛡️ HireRank &mdash; Project Athena</h1>
  <p><b>Next-Generation Autonomous Technical Interview Platform with Verifiable CV Integrity & Evidence-First Scoring.</b></p>
</div>

<br/>

## 🌟 Overview
**HireRank** is an enterprise-grade AI technical interview platform designed to elevate talent assessment through verifiable behavioral integrity and deep semantic evaluation. It combines **Edge-Computed Computer Vision** with **Cloud LLM Intelligence (Groq + Llama 3.3 70B)** to create a realistic, adaptive, and evidence-grounded interview chamber.

Unlike traditional proctoring that relies on aggressive auto-disqualification, Project Athena introduces the **Contextual Integrity Timeline** &mdash; logging observable events (out of frame, multiple faces, tab switching) as timestamped Review Markers for human recruiters while preserving candidate dignity.

---

## 🏛️ HireRank Core Pillars

### 1. Resume-to-Reality
Ingests candidate resume PDFs along with the Job Description to automatically extract key technical claims and formulate **3 Candidate-Reviewable Verification Topics** that anchor the interview.

### 2. Adaptive Question Engine
Dynamically branches follow-up questions based on the candidate's spoken responses and live code, enforced by backend guardrails allowing **maximum 2 follow-ups per competency** before rotating.

### 3. Explain-While-You-Build
Seamlessly embeds the Monaco Editor (Python, JavaScript, TypeScript) side-by-side with webcam feed and live speech captions so candidates can write code and speak simultaneously without modal barriers.

### 4. Evidence-First Scoring
Every single rubric score is backed by an **exact verbatim quote** and **transcript timestamp [MM:SS]** directly cited from the interview conversation.

### 5. Dual-Role Post-Interview Portals
* **Recruiter Triage Dashboard:** Contextual Integrity Timeline with clickable review markers that jump directly to the exact turn in the transcript, competency radar maps, and fast-track hiring decisions.
* **Candidate Growth Coach:** Constructive development report providing prioritized study topics, gap analyses, and a 30-day technical mastery roadmap.

---

## 🏗️ Architecture & Technology Stack
* **Framework:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion
* **AI NLP & Speech:** Groq Cloud SDK (`llama-3.3-70b-versatile`, `whisper-large-v3`), Web Speech API
* **Edge Vision:** MediaPipe FaceMesh (multi-face tracking, client-side yaw heuristics, no video uploaded to servers)
* **Code Workspace:** Monaco Editor (`@monaco-editor/react`)
* **Analytics:** Recharts Radar & Performance breakdowns

---

## 🚀 Getting Started

1. Clone or open the HireRank repository:
```bash
cd hirerank
```

2. Install dependencies:
```bash
npm install
```

3. Configure your `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key_here
UPSTASH_REDIS_REST_URL=your_upstash_url_here (optional)
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here (optional)
```

4. Launch the local development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to access **HireRank**.
