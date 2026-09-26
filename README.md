# 🛡️ HireRank &mdash; Autonomous Technical Interview & Verification Platform

<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" width="55" alt="Next.js" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="55" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="55" alt="Tailwind CSS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Python-Dark.svg" width="55" alt="Python" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/JavaScript.svg" width="55" alt="JavaScript" />

  <br/><br/>

  <p align="center">
    <b>Next-Generation Autonomous Technical Interview Platform with Client-Side CV Integrity, Multi-Resume Ingestion, Automated Email Invitations & Evidence-First Scoring.</b>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-end-to-end-architecture">Architecture</a> •
    <a href="#-dual-role-portals">Dual-Role Portals</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-judge-pitch-guide">Presentation Guide</a>
  </p>
</div>

---

## 🌟 Executive Summary

Traditional technical hiring is broken: resume screening is flooded with AI-generated buzzwords, while human engineering interviews take weeks and cost thousands in engineering hours. On the other hand, automated coding quizzes fail to test real-world architectural thinking, communication, or code reasoning.

**HireRank** solves this by unifying the entire hiring pipeline:
1. **Recruiters** batch-upload candidate resumes with a target job description; HireRank automatically extracts candidate profiles and dispatches customized interview invitation links via email.
2. **Candidates** enter a real-time, browser-based split-screen interview chamber powered by **MediaPipe edge computer vision**, concurrent coding in **Monaco Editor** (*Explain-While-You-Build*), and a **dynamically branching AI question engine**.
3. **Hiring Teams** receive an **Evidence-First Scoring Dossier**: every score is anchored to an exact verbatim quote and timestamp from the interview transcript, with interactive jumps and visual review markers.
4. **Candidates** receive a personalized **Growth Coach Roadmap** with prioritized study topics to fast-track technical seniority.

---

## 🚀 Key Features

### 1. Multi-Resume Ingestion & AI Candidate Extraction
- **Batch PDF Upload**: Recruiters can drag-and-drop or select multiple candidate PDF resumes simultaneously.
- **AI-Powered Identity Extraction** (`/api/extract-candidate-info`): Automatically extracts candidate full names, email addresses, and key technical competencies into an editable queue.
- **Manual Candidate Addition**: Support for adding candidates manually without a PDF.

### 2. Automated Email Invitation Engine
- **Direct Email Dispatch** (`/api/send-invitation-email`): Sends formatted HTML interview invitations with hiring company details, evaluated skills, customized notes, and secure assessment links (`/?invite=inv-xxxxxx`).
- **Resend & Native Mailto Support**: Supports live cloud dispatch via Resend API or direct 1-click `mailto:` triggers into native email clients (Gmail, Outlook, Apple Mail).
- **Delivery Status Tracking**: Live dashboard monitoring pending invitations and completed assessments.

### 3. Client-Side Edge Computer Vision Integrity
- **MediaPipe Face Mesh**: Runs client-side in the candidate's browser with **zero video streaming to servers**, protecting candidate privacy and eliminating server GPU costs.
- **Contextual Review Markers**: Detects candidate centering and multiple face appearances.
- **Non-Disqualifying Protocol**: Never auto-disqualifies candidates; instead, logs timestamped Review Markers on the recruiter timeline for human review.

### 4. Adaptive Question Engine (No Repetition)
- **Dynamic Branching**: Probes candidate claims and branches follow-up questions dynamically based on live spoken answers and code.
- **Anti-Repetition Protection**: Strictly tracks asked questions and enforces a maximum of 2 follow-ups per competency.
- **Skip Question Button**: Candidates can skip any question to pivot directly to another technical competency.

### 5. Explain-While-You-Build (Monaco IDE)
- Embedded Monaco Editor supporting Python, JavaScript, and TypeScript side-by-side with live webcam feed and real-time speech captions. Candidates write code and speak concurrently.

### 6. Evidence-First Scoring & Candidate Growth Coach
- **Verbatim Evidence Rubric**: Every rating is backed by an exact quote and `[MM:SS]` timestamp from the transcript.
- **Candidate Growth Coach**: Delivers an actionable engineering study roadmap with prioritized study topics and concrete resources.

---

## 🏛️ End-to-End Architecture

```
+---------------------------------------------------------------------------------------+
|                                  1. RECRUITER PORTAL                                  |
|                                                                                       |
|   +-----------------------+     +------------------------+     +------------------+   |
|   |  Batch Upload Resumes | --> | AI Candidate Extractor | --> |  Job Description |   |
|   |   (Multi-PDF / Text)  |     |  (Name, Email, Skills) |     |  & Custom Note   |   |
|   +-----------------------+     +------------------------+     +------------------+   |
|                                                                          |            |
|                                                                          v            |
|                                                             +-------------------------+
|                                                             | Dispatch Email Invites  |
|                                                             |  (Link: /?invite=...)   |
|                                                             +-------------------------+
+--------------------------------------------------------------------------|------------+
                                                                           |
                                                                           v
+---------------------------------------------------------------------------------------+
|                                  2. CANDIDATE PORTAL                                  |
|                                                                                       |
|   +------------------------+    +-----------------------+    +--------------------+   |
|   |  Receive Email Invite  | -> |  Resume-to-Reality    | -> | Split-Screen Live  |   |
|   |  & Login to Assessment |    | 3 Verification Topics |    |  Interview Chamber |   |
|   +------------------------+    +-----------------------+    +--------------------+   |
|                                                                          |            |
|               +----------------------------------------------------------+            |
|               |                                                                       |
|               v                                                                       v
|    [Client-Side Computer Vision]                                          [Live Adaptive Engine]
|    - MediaPipe Face Mesh on edge                                          - Dynamic question branching
|    - Centering & multiple face check                                      - Monaco Editor (Python/JS)
|    - Non-disqualifying Review Markers                                     - Speech-to-text live captions
+--------------------------------------------------------------------------|------------+
                                                                           |
                                                                           v
+---------------------------------------------------------------------------------------+
|                             3. VERIFIED OUTPUT & TRIAGE                               |
|                                                                                       |
|           +---------------------------------------------------------------+           |
|           |                 Evidence-First Scoring Engine                 |           |
|           |         (Every rating backed by verbatim transcript quote)    |           |
|           +---------------------------------------------------------------+           |
|                     |                                             |                   |
|                     v                                             v                   |
|       +----------------------------+               +------------------------------+   |
|       |    Candidate Growth Hub    |               |   Recruiter Audit Dossier    |   |
|       | - Readiness & depth scores |               | - Clickable CV marker jumps  |   |
|       | - Prioritized study topics |               | - Verbatim evidence quotes   |   |
|       | - Concrete learning tasks  |               | - Fast-Track Hire / Hold     |   |
|       +----------------------------+               +------------------------------+   |
+---------------------------------------------------------------------------------------+
```

---

## 👥 Dual-Role Portals

### 🏢 Recruiter Portal
- **Candidate Pipeline**: Search, filter by hiring status (`hire`, `next_round`, `hold`), and view aggregate readiness metrics.
- **Batch Upload & Invite**: Upload multiple PDF resumes, review extracted candidate names and emails, and batch-dispatch invitation emails.
- **Candidate Audit Dossier**:
  - Interactive Contextual Integrity Timeline with clickable review markers that jump to exact moments in the candidate's transcript.
  - Verbatim Evidence Rubric with scores and reasoning.
  - Triage decision buttons: *Fast-Track Hire*, *Advance Next Round*, or *Hold*.

### 🎓 Candidate / Employee Portal
- **Interview Invitations**: Displays all incoming invitations with company badge, role requirements, expiry date, and recruiter message. Includes 1-click **"Accept & Enter Interview Chamber"**.
- **My Interviews & Results**: Historical record of completed assessments, overall readiness scores, technical depth metrics, and personalized growth roadmaps.
- **Self-Paced Practice Chamber**: Allows candidates to configure custom job descriptions and practice independently.

---

## 🔌 API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/parse-resume` | `POST` | Parses binary PDF resumes into structured raw text using `pdf2json`. |
| `/api/extract-candidate-info` | `POST` | Extracts candidate name, email, and skills from resume text using Groq LLM. |
| `/api/send-invitation-email` | `POST` | Dispatches formatted HTML interview invitations with unique assessment tokens. |
| `/api/athena/extract-claims` | `POST` | Cross-references resume text against Job Description to generate 3 verification topics. |
| `/api/athena/adaptive-question` | `POST` | Generates non-repeating adaptive follow-up questions with competency bounds. |
| `/api/athena/evidence-score` | `POST` | Evaluates conversation transcript to output rubric ratings with verbatim quotes. |
| `/api/evaluate` | `POST` | Evaluates individual answers for immediate feedback scoring. |
| `/api/get-hint` | `POST` | Generates contextual hints with score-cap tracking. |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide React Icons |
| **AI LLM Inference** | Groq Cloud SDK (`llama-3.1-8b-instant`) with automatic fallback |
| **Edge Computer Vision** | Google MediaPipe Face Mesh (CDN, client-side browser execution) |
| **Code Workspace** | Monaco Editor (`@monaco-editor/react`) |
| **PDF Processing** | Node.js `pdf2json` binary decoding runtime |
| **Data Persistence** | Type-safe embedded client storage (`localStorage`) + modular data stores |

---

## 💻 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Harsha125-art/CTRL-C-CTRL-V.git
cd CTRL-C-CTRL-V
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Required: Groq API Key for LLM Inference
GROQ_API_KEY=your_groq_api_key_here

# Optional: Resend API Key for live email dispatching
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=HireRank <onboarding@resend.dev>
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---


---

## 👥 Contributors & Hackathon Team
- **Project**: HireRank &mdash; Autonomous Technical Interview & Verification Platform
- **Repository**: [https://github.com/Harsha125-art/CTRL-C-CTRL-V](https://github.com/Harsha125-art/CTRL-C-CTRL-V)
- **Built for**: BitNBuild Hackathon
