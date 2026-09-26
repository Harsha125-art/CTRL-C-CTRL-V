'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Loader2,
  Code2,
  Play,
  Square,
  Flag,
  Bot,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Layers,
  CheckCircle2,
  Users,
  VideoOff,
  Volume2
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReviewMarker,
  TranscriptTurn,
  VerificationTopic,
  AthenaCompetencyState,
  RubricEvidenceItem,
  CandidateStudyTopic
} from '@/types/athena';
import { CvIntegrityTracker, formatTimestamp } from '@/lib/cvIntegrity';
import LiveCaptions from '@/components/athena/LiveCaptions';
import ResumeToRealityModal from '@/components/athena/ResumeToRealityModal';
import AthenaLoadingSkeleton from '@/components/athena/AthenaLoadingSkeleton';

// Declare types for CDN loaded MediaPipe
declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export default function InterviewRoom() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(100);

  // Setup Mode & Ingestion States
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isPasteMode, setIsPasteMode] = useState(false);

  // Resume-to-Reality States
  const [projectClaims, setProjectClaims] = useState<string[]>([]);
  const [verificationTopics, setVerificationTopics] = useState<VerificationTopic[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isExtractingClaims, setIsExtractingClaims] = useState(false);

  // Interview Questions & Adaptive Engine States
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('Loading your first question...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCodingQuestion, setIsCodingQuestion] = useState(false);
  const [codeContent, setCodeContent] = useState('// Write your code here (Python or JavaScript)...');
  const [language, setLanguage] = useState('python');

  const [competencyState, setCompetencyState] = useState<AthenaCompetencyState>({
    currentCompetency: 'System Architecture & Design',
    followUpCount: 0,
    totalCompetenciesCompleted: 0
  });

  // Session Timing & Contextual Integrity Timeline
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [reviewMarkers, setReviewMarkers] = useState<ReviewMarker[]>([]);
  const [cvAlertMessage, setCvAlertMessage] = useState<string | null>(null);
  const cvTrackerRef = useRef(new CvIntegrityTracker());

  // Interactive Transcript & Evidence-First Data
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [rubricEvidence, setRubricEvidence] = useState<RubricEvidenceItem[]>([]);
  const [studyTopics, setStudyTopics] = useState<CandidateStudyTopic[]>([]);

  // Live Captions & Subtitles
  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Timer & Hint States
  const [timeLeft, setTimeLeft] = useState(300);
  const [hintText, setHintText] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintRequested, setHintRequested] = useState(false);

  // Rules Modal State
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Completion States
  const [isFinished, setIsFinished] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const trueConfidenceSumRef = useRef(0);
  const trueConfidenceCountRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const isTimeUpRef = useRef(false);
  const submitRef = useRef<() => void>();

  // Behavioral Tab Tracking (Logs marker, does NOT auto-disqualify)
  useEffect(() => {
    if (isSetupMode || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const marker = cvTrackerRef.current.createTabSwitchMarker(sessionElapsedSeconds);
        setReviewMarkers((prev) => [...prev, marker]);
        setCvAlertMessage('Tab switched or minimized — logged on Contextual Integrity Timeline for recruiter review.');
        setTimeout(() => setCvAlertMessage(null), 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSetupMode, isFinished, sessionElapsedSeconds]);

  // Session Timer Incrementer
  useEffect(() => {
    if (isSetupMode || isFinished) return;
    const interval = setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSetupMode, isFinished]);

  // Question Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSetupMode && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            isTimeUpRef.current = true;
            if (submitRef.current) submitRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSetupMode, isFinished, timeLeft]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setLiveTranscript(currentTranscript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Multi-Face MediaPipe CV Analysis Callback
  const onResults = useCallback(
    (results: any) => {
      if (canvasRef.current && webcamRef.current?.video) {
        canvasRef.current.width = webcamRef.current.video.videoWidth;
        canvasRef.current.height = webcamRef.current.video.videoHeight;
        const canvasCtx = canvasRef.current.getContext('2d');

        if (canvasCtx) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          const analysis = cvTrackerRef.current.analyzeFrame(
            results.multiFaceLandmarks,
            sessionElapsedSeconds
          );

          // Update confidence
          setConfidenceScore((prev) => {
            const newScore = prev * 0.8 + analysis.confidenceScore * 0.2;
            trueConfidenceSumRef.current += newScore;
            trueConfidenceCountRef.current += 1;
            return Math.round(newScore);
          });

          // Log Review Marker if detected (No auto-disqualify)
          if (analysis.markerToLog) {
            setReviewMarkers((prev) => [...prev, analysis.markerToLog!]);
          }

          if (analysis.hasVisualAlert && analysis.alertMessage) {
            setCvAlertMessage(analysis.alertMessage);
          } else if (!analysis.hasVisualAlert && cvAlertMessage) {
            setCvAlertMessage(null);
          }

          // Draw Facial Landmarks Mesh for all detected faces
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            results.multiFaceLandmarks.forEach((landmarks: any[], faceIdx: number) => {
              canvasCtx.fillStyle = faceIdx === 0 ? 'rgba(34, 197, 94, 0.75)' : 'rgba(239, 68, 68, 0.85)';
              for (const point of landmarks) {
                const x = point.x * canvasRef.current!.width;
                const y = point.y * canvasRef.current!.height;
                canvasCtx.beginPath();
                canvasCtx.arc(x, y, 1.3, 0, 2 * Math.PI);
                canvasCtx.fill();
              }
            });
          }

          canvasCtx.restore();
        }
      }
    },
    [sessionElapsedSeconds, cvAlertMessage]
  );

  // Initialize MediaPipe FaceMesh with multi-face detection (maxNumFaces: 4)
  useEffect(() => {
    if (isSetupMode) return;

    if (!window.FaceMesh) {
      console.warn('MediaPipe FaceMesh not yet available on window');
      return;
    }

    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    // Reconfigure to detect both missing faces and multiple faces
    faceMesh.setOptions({
      maxNumFaces: 4,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    let animationFrameId: number;

    const processFrame = async () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        try {
          await faceMesh.send({ image: webcamRef.current.video });
          if (!isLoaded) setIsLoaded(true);
        } catch (e) {
          // ignore stream closes
        }
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    const timeoutId = setTimeout(() => {
      processFrame();
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      try {
        faceMesh.close();
      } catch (e) {}
    };
  }, [isSetupMode, onResults, isLoaded]);

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let options = { mimeType: 'audio/webm' };
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setLiveTranscript('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access blocked or unavailable. You can use the Voice/Text Fallback below the camera to type your answers.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      mediaRecorderRef.current.onstop = async () => {
        await processAudioAnswer();
      };
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Keep submitRef updated for auto-submission on timeout
  useEffect(() => {
    submitRef.current = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      } else {
        processAudioAnswer();
      }
    };
  });

  // Evaluate candidate answer and trigger adaptive next question
  const processAudioAnswer = async (manualOverrideText?: string) => {
    try {
      let finalTranscript = manualOverrideText || 'No audio recorded.';

      if (!manualOverrideText && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const transcribeRes = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (transcribeRes.ok) {
            const { text } = await transcribeRes.json();
            const cleanedText = text?.trim() || '';
            if (cleanedText && !cleanedText.toLowerCase().includes('amara.org')) {
              finalTranscript = cleanedText;
            }
          }
        }
      }

      if (!finalTranscript || finalTranscript === 'No audio recorded.') {
        if (liveTranscript.trim()) {
          finalTranscript = liveTranscript.trim();
        }
      }

      const candidateTimestamp = formatTimestamp(sessionElapsedSeconds);

      // Record candidate turn in transcript
      const candidateTurn: TranscriptTurn = {
        id: `turn-cand-${Date.now()}`,
        speaker: 'candidate',
        timestamp: candidateTimestamp,
        elapsedSeconds: sessionElapsedSeconds,
        text: finalTranscript,
        codeSnippet: isCodingQuestion ? codeContent : undefined,
        competency: competencyState.currentCompetency,
        questionIndex,
      };

      setTranscript((prev) => [...prev, candidateTurn]);

      // Call evaluate API (preserving existing evaluation logic)
      const evaluateRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer: finalTranscript,
          confidenceScore: Math.round(confidenceScore),
          code: isCodingQuestion ? codeContent : null,
          resumeText,
          questionIndex,
        }),
      });

      const evaluation = await evaluateRes.json();
      evaluation.transcribedText = finalTranscript;

      let finalScore = evaluation.score || 0;
      if (hintRequested) {
        finalScore = Math.min(80, finalScore);
        evaluation.evaluation = '[Penalty Applied: -20% Max Score for using AI Hint] ' + evaluation.evaluation;
      }

      setFeedback(evaluation);

      // Update feedback history
      setFeedbackHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          evaluation: evaluation.evaluation,
          score: finalScore,
          transcribedText: finalTranscript,
        },
      ]);

      // If at end of session (questionIndex >= 5), run Evidence-First Scoring and finish
      if (questionIndex >= 5) {
        await finalizeInterviewSession([...transcript, candidateTurn]);
        setIsFinished(true);
        return;
      }

      // Adaptive Question Generation (Backend limit: max 2 follow-ups per competency)
      setIsTransitioning(true);
      const adaptiveRes = await fetch('/api/athena/adaptive-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousQuestion: currentQuestion,
          previousAnswer: finalTranscript,
          codeContent: isCodingQuestion ? codeContent : undefined,
          jobDescription,
          resumeText,
          verificationTopics,
          competencyState,
          questionIndex: questionIndex + 1,
        }),
      });

      if (adaptiveRes.ok) {
        const adaptiveData = await adaptiveRes.json();
        const nextQ = adaptiveData.nextQuestion || evaluation.next_question || 'How would you scale this architecture?';

        setCurrentQuestion(nextQ);
        setQuestionIndex((prev) => prev + 1);
        setIsCodingQuestion(adaptiveData.isCodingQuestion || false);
        if (adaptiveData.isCodingQuestion) {
          setCodeContent('// Explain-While-You-Build: Write your implementation here...\n');
        }

        if (adaptiveData.updatedCompetencyState) {
          setCompetencyState(adaptiveData.updatedCompetencyState);
        }

        // Record interviewer turn in transcript
        const interviewerTurn: TranscriptTurn = {
          id: `turn-interviewer-${Date.now()}`,
          speaker: 'interviewer',
          timestamp: formatTimestamp(sessionElapsedSeconds),
          elapsedSeconds: sessionElapsedSeconds,
          text: nextQ,
          competency: adaptiveData.competency || competencyState.currentCompetency,
          questionIndex: questionIndex + 1,
        };
        setTranscript((prev) => [...prev, interviewerTurn]);

        setTimeout(() => {
          setIsTransitioning(false);
          setTimeLeft(adaptiveData.isCodingQuestion ? 1800 : 300); // 30 mins for coding, 5 mins for theory
        }, 800);
      } else if (evaluation.next_question) {
        // Fallback to existing evaluation next_question
        setCurrentQuestion(evaluation.next_question);
        setQuestionIndex((prev) => prev + 1);
        setIsCodingQuestion(evaluation.isCodingQuestion || false);
        setTimeout(() => {
          setIsTransitioning(false);
          setTimeLeft(evaluation.isCodingQuestion ? 1800 : 300);
        }, 800);
      }

      setHintText('');
      setHintRequested(false);
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      alert(error.message || 'Failed to process answer.');
    } finally {
      setIsProcessing(false);
      isTimeUpRef.current = false;
    }
  };

  // Finalize interview session with Evidence-First scoring
  const finalizeInterviewSession = async (finalTranscriptList: TranscriptTurn[]) => {
    try {
      const res = await fetch('/api/athena/evidence-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: finalTranscriptList,
          jobDescription,
          resumeText,
          reviewMarkers,
        }),
      });

      if (res.ok) {
        const evidenceData = await res.json();
        if (evidenceData.rubricEvidence) setRubricEvidence(evidenceData.rubricEvidence);
        if (evidenceData.studyTopics) setStudyTopics(evidenceData.studyTopics);
      }
    } catch (e) {
      console.error('Failed to generate evidence scores:', e);
    }
  };

  const handleManualTextSubmit = (typedAnswer: string) => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    setIsProcessing(true);
    processAudioAnswer(typedAnswer);
  };

  const handleGetHint = async () => {
    setIsHintLoading(true);
    setHintRequested(true);
    try {
      const res = await fetch('/api/get-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, jobDescription, resumeText }),
      });
      const data = await res.json();
      setHintText(data.hint || 'Consider breaking the problem down into smaller testable modules.');
    } catch (e) {
      setHintText('Hint generation failed. Rely on core system design principles!');
    } finally {
      setIsHintLoading(false);
    }
  };

  // Resume Upload Handler (preserving existing pdf2json pipeline)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to parse resume');
      }

      setResumeText(data.text);
    } catch (error: any) {
      console.error(error);
      setUploadError(error.message || 'Error uploading resume.');
      setResumeText('');
    } finally {
      setIsUploading(false);
    }
  };

  // Step 1 of Start: Resume-to-Reality Claims Extraction
  const handleStartInterviewFlow = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description to tailor the interview.');
      return;
    }

    setIsExtractingClaims(true);

    try {
      const res = await fetch('/api/athena/extract-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeText || 'No resume uploaded. Standard fullstack software engineering role.',
        }),
      });

      const data = await res.json();
      if (data && data.verificationTopics && data.verificationTopics.length > 0) {
        setProjectClaims(data.projectClaims || []);
        setVerificationTopics(data.verificationTopics);
      } else {
        // Fallback default topics
        setProjectClaims([
          "Engineered backend services and scalable APIs",
          "Implemented database models and optimized latency",
          "Managed production deployments and monitoring"
        ]);
        setVerificationTopics([
          {
            id: "topic-1",
            title: "System Architecture & Request Lifecycle",
            sourceClaim: "Built high-performance API services",
            competency: "System Architecture",
            keyVerificationGoal: "Verify modular decomposition, request latency optimization, and failure handling",
            suggestedQuestions: ["Can you walk me through the architecture of your primary project?"]
          },
          {
            id: "topic-2",
            title: "Data Consistency & State Management",
            sourceClaim: "Implemented scalable data layers",
            competency: "Database Design",
            keyVerificationGoal: "Assess edge case handling, concurrency locks, and caching eviction strategies",
            suggestedQuestions: ["How did you maintain data consistency under high concurrent write loads?"]
          },
          {
            id: "topic-3",
            title: "Production Resilience & Incident Triage",
            sourceClaim: "Maintained production uptime and observability",
            competency: "Engineering Reliability",
            keyVerificationGoal: "Evaluate real-world debugging, rate-limiting, and error recovery instincts",
            suggestedQuestions: ["Describe a difficult production bug you solved and the safeguards you added."]
          }
        ]);
      }

      setShowVerificationModal(true);
    } catch (e) {
      console.warn('Extraction notice, proceeding with default verification topics:', e);
      setVerificationTopics([
        {
          id: "topic-1",
          title: "System Architecture & Request Lifecycle",
          sourceClaim: "Core Software Engineering Competency",
          competency: "System Architecture",
          keyVerificationGoal: "Verify modular decomposition and architecture trade-offs",
          suggestedQuestions: ["Can you walk me through the architecture of your primary project?"]
        },
        {
          id: "topic-2",
          title: "Algorithmic Problem Solving",
          sourceClaim: "Coding & Data Structures",
          competency: "Code Implementation",
          keyVerificationGoal: "Assess code structure and time/space complexity optimization",
          suggestedQuestions: ["How did you optimize your core algorithms for performance?"]
        },
        {
          id: "topic-3",
          title: "Production Reliability & Failure Modes",
          sourceClaim: "Operational Readiness",
          competency: "Engineering Reliability",
          keyVerificationGoal: "Evaluate resilience and monitoring instincts",
          suggestedQuestions: ["How do you protect your systems from cascading outages?"]
        }
      ]);
      setShowVerificationModal(true);
    } finally {
      setIsExtractingClaims(false);
    }
  };

  // Step 2 of Start: Confirm Verification Topics & Open Rules
  const handleConfirmVerificationTopics = () => {
    setShowVerificationModal(false);
    setShowRulesModal(true);
  };

  // Step 3 of Start: Agree to Proctoring & Launch First Question
  const handleAgreeAndStart = async () => {
    setShowRulesModal(false);
    setIsGenerating(true);

    let firstQ = 'To begin, could you walk me through the overall architecture of your primary project and the key technical trade-offs you made?';
    let isCoding = false;
    let initialCompetency = 'System Architecture & Design';

    try {
      const res = await fetch('/api/athena/adaptive-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          verificationTopics,
          competencyState: {
            currentCompetency: 'System Architecture & Design',
            followUpCount: 0,
            totalCompetenciesCompleted: 0,
          },
          questionIndex: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.nextQuestion) firstQ = data.nextQuestion;
        if (data.isCodingQuestion !== undefined) isCoding = data.isCodingQuestion;
        if (data.competency) initialCompetency = data.competency;
      }
    } catch (e) {
      console.warn('Network notice, using fallback starter question:', e);
    } finally {
      setCurrentQuestion(firstQ);
      setQuestionIndex(1);
      setIsCodingQuestion(isCoding);
      setIsSetupMode(false);
      setTimeLeft(isCoding ? 1800 : 300);
      setIsGenerating(false);

      // Record first interviewer turn in transcript
      setTranscript([
        {
          id: `turn-interviewer-${Date.now()}`,
          speaker: 'interviewer',
          timestamp: '00:00',
          elapsedSeconds: 0,
          text: firstQ,
          competency: initialCompetency,
          questionIndex: 1,
        },
      ]);
    }
  };

  // ==================== VIEW 1: SETUP MODE ====================
  if (isSetupMode) {
    return (
      <div className="w-full flex justify-center font-sans text-slate-100 mt-2">
        {/* Resume-to-Reality Claims Modal */}
        <ResumeToRealityModal
          isOpen={showVerificationModal}
          projectClaims={projectClaims}
          verificationTopics={verificationTopics}
          onConfirmAndStart={handleConfirmVerificationTopics}
          onCancel={() => setShowVerificationModal(false)}
        />

        {/* Proctoring Rules Modal (Updated for Project Athena - No Auto Disqualification) */}
        <AnimatePresence>
          {showRulesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-12 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden my-auto"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-5 border border-emerald-500/20 text-emerald-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1.5 tracking-tight">
                  Athena Contextual Integrity Protocol
                </h2>
                <p className="text-slate-400 text-xs mb-6 font-medium">
                  HireRank uses real-time computer vision integrity tracking to verify your session for hiring managers.
                </p>

                <div className="flex flex-col space-y-3 w-full text-left mb-8">
                  <div className="flex items-start space-x-3.5 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-emerald-400 font-bold text-base mt-0.5">1.</span>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Computer Vision Integrity Tracking</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Client-side edge vision tracks camera centering and frame presence. Leaving the frame or multiple individuals appearing in view are logged as Review Markers on the recruiter timeline.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-emerald-400 font-bold text-base mt-0.5">2.</span>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Adaptive Competency Probing</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Questions dynamically branch from your exact spoken words, with an enforced backend limit of max 2 follow-ups per competency.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-emerald-400 font-bold text-base mt-0.5">3.</span>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Explain-While-You-Build</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        The embedded Monaco Editor allows you to write Python or JavaScript while speaking. Live speech captions support voice or manual text input fallback.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 w-full">
                  <button
                    type="button"
                    onClick={() => setShowRulesModal(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleAgreeAndStart}
                    disabled={isGenerating}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Start Athena Simulation &rarr;</span>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Setup Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              HireRank Context Calibration
            </span>
            <h2 className="text-3xl font-black text-white mt-2 mb-2 tracking-tight">
              Configure Interview Context
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Provide your target Job Description and optional Resume PDF. Athena will extract project claims to anchor the technical verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Job Description Input */}
            <div className="flex flex-col space-y-2.5">
              <label className="text-xs font-black tracking-widest text-indigo-400 uppercase">
                1. Target Job Description
              </label>
              <textarea
                className="w-full h-72 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all shadow-inner"
                placeholder="Paste the job description or role requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Resume Upload Column */}
            <div className="flex flex-col space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  2. Resume (PDF or Paste)
                </label>
                <button
                  type="button"
                  onClick={() => setIsPasteMode(!isPasteMode)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline"
                >
                  {isPasteMode ? 'Switch to PDF Upload' : 'Paste Resume Text'}
                </button>
              </div>

              {isPasteMode ? (
                <textarea
                  className="w-full h-72 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all shadow-inner"
                  placeholder="Paste your raw resume text, work experience, and skills directly here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              ) : (
                <div className="w-full h-72 bg-black/40 border border-white/10 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center relative transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-center">
                  {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                      <p className="text-emerald-300 font-semibold text-sm">Extracting resume claims via AI...</p>
                    </div>
                  ) : uploadError ? (
                    <div className="flex flex-col items-center text-center">
                      <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
                      <p className="text-rose-400 font-bold text-xs">PDF Parsing Notice</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{uploadError}</p>
                      <div className="flex items-center space-x-3 mt-3">
                        <label className="cursor-pointer text-[11px] text-rose-300 underline font-bold uppercase">
                          Try Another PDF
                          <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                        </label>
                        <span className="text-slate-600 text-xs">or</span>
                        <button
                          type="button"
                          onClick={() => setIsPasteMode(true)}
                          className="text-[11px] text-emerald-400 underline font-bold uppercase"
                        >
                          Paste Text
                        </button>
                      </div>
                    </div>
                  ) : resumeText ? (
                    <div className="flex flex-col items-center animate-in fade-in">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2.5 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-emerald-300 font-bold text-base">Resume Parsed & Verified!</p>
                      <p className="text-xs text-slate-400 mt-1">Ready for Resume-to-Reality verification review.</p>
                      <label className="mt-3 cursor-pointer text-[11px] text-slate-400 hover:text-white underline">
                        Replace PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 border border-emerald-500/20 text-emerald-400">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-slate-300 font-semibold text-sm mb-1">Click to Upload Resume</p>
                      <p className="text-xs text-slate-500 mb-4 max-w-xs">
                        Athena cross-references your claims to build 3 targeted verification topics.
                      </p>
                      <label className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                        Select Resume PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-8">
            <button
              type="button"
              onClick={handleStartInterviewFlow}
              disabled={isExtractingClaims || isUploading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] flex justify-center items-center group"
            >
              {isExtractingClaims ? (
                <span className="flex items-center text-xs uppercase tracking-widest">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Extracting Verification Topics...
                </span>
              ) : (
                <span className="flex items-center text-xs uppercase tracking-widest font-black">
                  Proceed to Resume-to-Reality Review &rarr;
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==================== VIEW 2: POST-INTERVIEW PORTAL ====================
  if (isFinished) {
    const avgConfidence =
      trueConfidenceCountRef.current > 0
        ? Math.round(trueConfidenceSumRef.current / trueConfidenceCountRef.current)
        : 85;

    return (
      <div className="w-full min-h-screen p-4 sm:p-8 font-sans text-slate-100">
        <Dashboard
          feedbackHistory={feedbackHistory}
          averageConfidence={avgConfidence}
          reviewMarkers={reviewMarkers}
          transcript={transcript}
          rubricEvidence={rubricEvidence}
          studyTopics={studyTopics}
          jobTitle="Senior Software Engineer"
        />
      </div>
    );
  }

  // ==================== VIEW 3: LIVE SPLIT-SCREEN INTERVIEW CHAMBER ====================
  return (
    <div className="w-full flex flex-col space-y-6 font-sans text-slate-100 relative">
      
      {/* Non-Disqualifying CV Alert Banner */}
      <AnimatePresence>
        {cvAlertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-xl w-full px-4"
          >
            <div className="bg-amber-950/90 border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center space-x-3 text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1 text-xs">
                <span className="font-bold block text-white">Contextual Integrity Notice</span>
                <span>{cvAlertMessage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar: Competency & Status */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
            HR
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">HireRank Athena</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {competencyState.currentCompetency}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Branching Follow-up: {competencyState.followUpCount} of 2 max per competency
            </p>
          </div>
        </div>

        {/* Timers & CV Integrity Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 uppercase font-mono text-[10px]">Session:</span>
            <span className="font-mono text-white font-bold">{formatTimestamp(sessionElapsedSeconds)}</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border font-mono text-xs font-bold ${
              timeLeft < 60
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : 'bg-white/5 border-white/10 text-emerald-400'
            }`}
          >
            <span>Q Time:</span>
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden md:inline">Eye Contact:</span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  confidenceScore > 75
                    ? 'bg-emerald-400'
                    : confidenceScore > 40
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-300 w-8">{confidenceScore}%</span>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE: Webcam Feed + Live Captions with Voice/Text Fallback + Action Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Webcam Container */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl">
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                <p className="text-xs text-indigo-300 font-medium">Starting MediaPipe Face Models...</p>
              </div>
            )}

            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              className="absolute inset-0 w-full h-full object-cover"
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none opacity-80"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* In-Video Recording Badge */}
            {isRecording && (
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-rose-500/40 px-3 py-1.5 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-bold tracking-widest text-rose-200 uppercase">Recording Live</span>
              </div>
            )}

            {/* In-Video Review Marker Indicator */}
            {reviewMarkers.length > 0 && (
              <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] text-slate-300">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>{reviewMarkers.length} Markers</span>
              </div>
            )}
          </div>

          {/* Live Captions with Voice/Text Fallback */}
          <LiveCaptions
            liveTranscript={liveTranscript}
            isRecording={isRecording}
            onManualTextSubmit={handleManualTextSubmit}
            disabled={isProcessing}
          />

          {/* Action Control Buttons */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                  : isProcessing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Evaluating Response...</span>
                </>
              ) : isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2 fill-current" />
                  <span>End Answer & Evaluate</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  <span>Start Speaking</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFinished(true)}
              disabled={isRecording || isProcessing}
              className="px-4 py-4 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center"
              title="Finish Interview"
            >
              <Flag className="w-4 h-4 mr-1.5" />
              <span>Conclude</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Question Cards + Monaco Editor Workspace + Athena Skeletons (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Question Card or Loading Skeleton */}
          {isProcessing || isGenerating ? (
            <AthenaLoadingSkeleton
              type="question"
              title="Athena Adaptive Engine"
              subtitle="Processing your explanation & synthesising next competency probe"
            />
          ) : (
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                    Question {questionIndex} / 5
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {isCodingQuestion && (
                    <span className="bg-indigo-500/10 text-indigo-300 text-[10px] px-2.5 py-1 rounded-md border border-indigo-500/20 font-bold flex items-center">
                      <Code2 className="w-3 h-3 mr-1" /> Explain-While-You-Build
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                    {competencyState.currentCompetency}
                  </span>
                </div>
              </div>

              <p className="text-lg md:text-xl font-medium text-white leading-snug">
                "{currentQuestion}"
              </p>

              {/* Contextual Hint Display */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                {hintText ? (
                  <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex-1">
                    <span className="font-bold block text-amber-400">Athena Hint (-20% score cap):</span>
                    {hintText}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetHint}
                    disabled={isHintLoading}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    {isHintLoading ? 'Generating hint...' : 'Need a hint? (Caps score at 80%)'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Explain-While-You-Build Monaco Editor Area */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Explain-While-You-Build Workspace
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Code & speak concurrently
                </span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-black/50 text-xs font-bold text-slate-300 border border-white/10 rounded-lg px-3 py-1 outline-none"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={codeContent}
                onChange={(val) => setCodeContent(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'monospace',
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
