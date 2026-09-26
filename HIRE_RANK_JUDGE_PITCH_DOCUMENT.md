# HireRank &mdash; Autonomous Technical Interview & Verification Platform
## Comprehensive Pitch, Architecture & Hackathon Presentation Guide

---

## 1. Executive Summary & 30-Second Elevator Pitch

> **The Problem:**  
> Traditional technical hiring is broken and unscalable. Resume screening is inundated with AI-generated buzzwords, while human technical interview loops consume hundreds of costly engineering hours. On the other hand, automated coding quizzes fail to test real-world architectural thinking, communication, or genuine project ownership.
>
> **The Solution:**  
> **HireRank** is an end-to-end autonomous technical interview and verification platform.  
> - **Recruiters** batch-upload candidate resumes with a target job description; HireRank extracts candidate identities, skills, and issues automated email invitations with secure assessment links.
> - **Candidates** enter an adaptive, real-time split-screen chamber featuring client-side edge Computer Vision integrity tracking, live speech recognition, an embedded Monaco IDE (*Explain-While-You-Build*), and a dynamically branching question engine.
> - **Hiring Teams** receive an **Evidence-First Scoring Dossier**: every score is anchored to an exact verbatim quote and timestamp from the interview transcript, with interactive jumps and visual review markers.
> - **Candidates** receive a personalized **Growth Coach Roadmap** with prioritized study topics to fast-track technical seniority.

---

## 2. End-to-End System Workflow & Architecture

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

## 3. Step-by-Step 2-Minute Judge Demo Script

### Step 1: Role-Based Gate (15 seconds)
1. Navigate to the application (`http://localhost:3000`).
2. Point out: *"HireRank features dual role-based access control. Let's start with the hiring manager flow."*
3. Click **"1-Click Recruiter Demo (Sarah Jenkins)"**.

### Step 2: Batch Resume Upload & Email Dispatch (35 seconds)
1. Switch to the **"Batch Upload & Invite"** tab.
2. Select multiple candidate PDF resumes (or click *"Add Candidate Manually"*).
3. Demonstrate:
   - HireRank's AI parser automatically extracts candidate names, emails, and technical skill sets into a live queue.
   - Recruiter configures the target Job Title and Job Description.
4. Click **"Send Email Invitations to All"**:
   - Point out: *"HireRank generates cryptographically unique invitation tokens, dispatches structured HTML email invitations, and logs live delivery with direct mailto fallback triggers."*

### Step 3: Candidate Experience & Adaptive Chamber (40 seconds)
1. Click **Switch to Employee** (or sign in as candidate `Alex Rivera`).
2. Open the **"Interview Invitations"** tab:
   - Show the newly arrived invitation with company badge, role requirements, and recruiter note.
3. Click **"Accept & Enter Interview Chamber"**:
   - The job context and resume claims are automatically loaded.
   - Review the **Resume-to-Reality** modal: HireRank cross-references claims to generate 3 targeted verification topics.
   - Click **Start Simulation**:
     - **Webcam feed**: MediaPipe tracks face centering and multi-face events; logs non-disqualifying review markers on the audit timeline.
     - **Explain-While-You-Build**: Candidate can code concurrently in Monaco Editor (Python/JS).
     - **Adaptive Questioning**: Questions branch dynamically from candidate answers without repetitive looping.

### Step 4: Evidence-First Scoring & Recruiter Triage (30 seconds)
1. Click **"Conclude"**:
   - Show the candidate's **Growth Coach**: personalized study roadmap and strengths.
2. Toggle back to **Recruiter Portal**:
   - Open the **Candidate Pipeline** and click **"Dossier"**:
   - **Clickable Timeline**: Click any CV review marker to jump directly to the exact second in the transcript.
   - **Evidence-First Rubric**: Every rating quotes the candidate verbatim with timestamps.
   - Show the **Triage Actions**: Fast-Track Hire, Advance Next Round, or Hold.

---

## 4. Competitive Differentiation Matrix

| Dimension | Conventional Platforms / LeetCode | HireRank Innovation |
| :--- | :--- | :--- |
| **Proctoring Philosophy** | Aggressive auto-disqualification on false positives. | **Contextual Review Markers**: Non-disqualifying client-side edge flags recorded on the timeline for recruiter review. |
| **Scoring Verification** | Opaque black-box scores or shallow bullet points. | **Evidence-First Scoring**: Every score rubric is verified by exact verbatim quotes from the candidate transcript. |
| **Question Adaptability** | Fixed LeetCode-style questions memorized online. | **Resume-to-Reality + Adaptive Engine**: Dynamically probes candidate claims and branches off live spoken answers. |
| **Recruiter Workflow** | Disconnected emails, calendars, and manual tracking. | **Integrated Batch Pipeline**: Multi-resume ingestion, automated AI parsing, and 1-click email invitation links. |
| **Candidate Takeaway** | Generic rejection emails with zero feedback. | **Candidate Growth Coach**: Actionable engineering study roadmaps targeting detected technical gaps. |

---

## 5. Technical Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling & UI**: Tailwind CSS + Framer Motion + Lucide Icons
- **Code Workspace**: Monaco Editor (`@monaco-editor/react`)
- **Edge Computer Vision**: MediaPipe Face Mesh (CDN client-side execution, zero server video streaming)
- **Speech Processing**: Web Speech API / MediaRecorder audio pipelines
- **AI Inference Engine**: Groq SDK (`llama-3.1-8b-instant`) with sub-second latency and cascading multi-tier fallback
- **Resume Ingestion**: Node.js `pdf2json` binary decoding + AI structured information extraction
- **Email Dispatching**: Integrated HTML email service with Resend API support and native `mailto:` fallback
- **State & RBAC**: Persistent client-side session store + role-based auth context (`recruiter` / `candidate`)

---

## 6. Anticipated Judge Q&A

**Q1: How do you protect candidate privacy during proctoring?**  
*Answer:* Video feeds are processed entirely client-side using MediaPipe in the candidate's browser. Raw camera feeds never leave the user's computer; only lightweight, timestamped event markers (e.g. face out of frame) are saved.

**Q2: What happens if an LLM call fails or times out during a live interview?**  
*Answer:* The adaptive engine implements a multi-tier fallback matrix. If the model latency exceeds threshold, it gracefully falls back to structured, non-repeating competency probes based on the active topic.

**Q3: How does Evidence-First Scoring prevent AI hallucinations in grading?**  
*Answer:* The scoring prompt mandates exact string quotes and timestamps from the candidate transcript. If a claim lacks verbatim backing in the transcript, the evaluator is penalized from assigning high scores.

---
*Created for the BitNBuild Hackathon &mdash; HireRank Engineering Team*
