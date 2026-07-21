import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, BrainCircuit, Volume2, VolumeX,
  ShieldCheck, Zap, Activity, Cpu, Timer,
  ChevronRight, MessageSquare, SkipForward,
} from "lucide-react";
import PageTransition from "../../components/PageTransition";
import AIProcessingScreen from "./AIProcessingScreen";
import NeuralAlert from "../../components/NeuralAlert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";

export default function InterviewPage() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  // --- Questions State ---
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // --- Session State ---
  const [isRecording, setIsRecording] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micError, setMicError] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);

  // --- Audio / Hint Features ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // --- MediaRecorder ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  // Fetch active questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await apiClient.get("/questions/active");
        if (data.data && data.data.length > 0) {
          setQuestions(data.data);
        } else {
          // Fallback sample questions if bank is empty
          setQuestions([
            { _id: "fallback-1", text: "Explain how the Virtual DOM optimization works in React's reconciliation process.", category: "REACT.JS" },
            { _id: "fallback-2", text: "How does the Event Loop handle asynchronous operations in Node.js?", category: "NODE.JS" },
            { _id: "fallback-3", text: "What are the key differences between SQL and NoSQL databases?", category: "SYSTEM DESIGN" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
        setQuestions([
          { _id: "fallback-1", text: "Explain how the Virtual DOM optimization works in React's reconciliation process.", category: "REACT.JS" },
        ]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isRecording && timeLeft > 0) return;
    if (timeLeft <= 0) {
      // Auto skip when time runs out
      handleSkipOrNext();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setShowHint(false);
  }, [currentIndex]);

  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(currentQuestion?.text || "");
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      setMicError("AI Voice not supported in older browsers.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- MediaRecorder Logic ---
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setMicError("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const [finalResult, setFinalResult] = useState(null);

  // Skip to next question or end session
  const handleSkipOrNext = () => {
    if (isRecording) stopRecording();

    setAnsweredCount((prev) => prev + 1);

    const isLast = currentIndex >= questions.length - 1;
    if (isLast) {
      setTimeout(() => setIsProcessing(true), 400);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(120); // Reset timer per question
      setIsRecording(false);
    }
  };

  const handleEndSession = () => {
    if (isRecording) stopRecording();
    setTimeout(() => setIsProcessing(true), 400);
  };

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;

  useEffect(() => {
    if (isProcessing) {
      const finalizeNeuralSync = async () => {
        await new Promise(r => setTimeout(r, 600)); // give MediaRecorder time to build blob
        const formData = new FormData();
        if (audioBlobRef.current) {
          formData.append("audio", audioBlobRef.current, "interview.webm");
        }
        formData.append("answeredCount", answeredCount);
        formData.append("totalQuestions", totalQuestions);
        formData.append("category", questions[currentIndex]?.category || "General");

        try {
          // Send to our new real endpoint
          const { data } = await apiClient.post("/v1/interviews/process-voice", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          setFinalResult(data.data);
        } catch (err) {
          console.error("Neural processing failed:", err);
          setFinalResult({ score: 70, feedback: "Processing offline. Assigned default score." });
        }
      };
      finalizeNeuralSync();
    }
  }, [isProcessing, answeredCount, totalQuestions, currentIndex, questions]);

  if (isProcessing) {
    const sessionData = {
      answeredCount,
      totalQuestions,
      questionsAnswered: questions.slice(0, currentIndex + 1).map(q => q.text),
      score: finalResult ? finalResult.score : Math.floor(Math.random() * 20) + 75,
      feedback: finalResult ? finalResult.feedback : "",
      category: currentQuestion?.category || "General",
      candidateName: userInfo?.name || "Candidate",
    };
    
    return <AIProcessingScreen onComplete={() => navigate("/report", { state: sessionData })} />;
  }

  if (loadingQuestions) {
    return (
      <div className="h-screen bg-[#02060f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          <p className="text-emerald-500 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">
            Loading Neural Questions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="h-screen w-full bg-[#f8fafc] dark:bg-[#02060f] text-slate-900 dark:text-white font-sans overflow-hidden relative flex transition-colors duration-500">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
        </div>

        {/* LEFT PANEL — Question */}
        <aside className="w-[50%] h-full border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#050a14]/50 backdrop-blur-3xl flex flex-col p-8 md:p-12 relative z-20 overflow-hidden shadow-2xl">
          <div className="flex-1 flex flex-col justify-center space-y-8 md:space-y-12">

            {/* Session tag */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                  Neural Session Active
                </span>
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest">Challenge</span>
                <span className="text-lg font-black text-slate-900 dark:text-white italic">
                  {String(currentIndex + 1).padStart(2, "0")}{" "}
                  <span className="text-slate-300 dark:text-gray-600 text-sm not-italic">/ {String(totalQuestions).padStart(2, "0")}</span>
                </span>
              </div>
            </div>

            {/* Question Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-4 md:space-y-6"
              >
                {currentQuestion?.category && (
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                    {currentQuestion.category}
                  </span>
                )}
                <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white/90 italic uppercase">
                  {currentQuestion ? currentQuestion.text : "Loading question..."}
                </h2>
                <p className="text-slate-400 dark:text-gray-500 text-xs md:text-sm leading-relaxed font-medium max-w-sm italic">
                  Take your time. Speak clearly into the microphone. You can skip if needed.
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Skip Button */}
            <div className="pt-8 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={handleSkipOrNext}
                className="group flex items-center gap-3 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
                  {currentIndex >= totalQuestions - 1 ? (
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-emerald-500" />
                  ) : (
                    <SkipForward size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {currentIndex >= totalQuestions - 1 ? "Finish Session" : "Next Question"}
                </span>
              </button>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black shadow-inner text-emerald-500">
                {(userInfo?.name || "CA").substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white/80">{userInfo?.name || "Candidate"}</p>
                <p className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-tighter">{userInfo?.email || ""}</p>
              </div>
            </div>

            {/* Abort Button */}
            <button
              onClick={() => setShowAlert(true)}
              className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-500/5"
            >
              <Zap size={18} />
            </button>
          </div>
        </aside>

        {/* RIGHT PANEL — Mic + Controls */}
        <main className="flex-1 h-full relative z-10 overflow-hidden flex flex-col items-center">

          {/* Timer */}
          <div className="absolute top-[80px] md:top-[100px] left-[30px] md:left-[60px] z-20">
            <motion.div
              className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border backdrop-blur-3xl shadow-2xl transition-all duration-500 ${
                timeLeft <= 20
                  ? "bg-red-500/10 border-red-500/20 shadow-red-500/5"
                  : "bg-white/80 dark:bg-[#0a101f]/40 border-slate-200 dark:border-white/5"
              }`}
            >
              <Timer
                size={18}
                className={`${timeLeft <= 20 ? "text-red-500 animate-bounce" : "text-emerald-500 animate-pulse"}`}
              />
              <span className={`font-mono text-2xl font-black tracking-widest ${timeLeft <= 20 ? "text-red-500" : "text-slate-900 dark:text-white/90"}`}>
                {formatTime(timeLeft)}
              </span>
            </motion.div>
          </div>

          {/* Mic Error */}
          {micError && (
            <div className="absolute top-[80px] md:top-[100px] right-6 z-20 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
              {micError}
            </div>
          )}

          {/* AI Hint UI */}
          <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-[80px] md:top-[100px] right-[30px] md:right-[60px] z-20 max-w-[250px] bg-[#0c1424] border border-indigo-500/30 p-5 rounded-2xl shadow-2xl"
              >
                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Cpu size={14} /> Neural Hint
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed italic">
                  Focus on the "Why" and "How". Use the STAR method to structure your {currentQuestion?.category || "technical"} response. Speak confidently.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central Brain Hub */}
          <div className="flex-1 flex flex-col items-center justify-start pt-24 md:pt-32">
            <div className="relative flex items-center justify-center w-[260px] md:w-[300px] aspect-square">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-emerald-500/10 rounded-full"
              />

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div
                    className={`absolute inset-0 blur-[40px] transition-all duration-1000 ${
                      isRecording ? "bg-emerald-500/20" : "bg-red-500/5"
                    }`}
                  />
                  <motion.div
                    animate={isRecording ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-[35px] bg-white dark:bg-[#030812] border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden"
                  >
                    <BrainCircuit
                      size={45}
                      className={`${isRecording ? "text-emerald-500" : "text-slate-200 dark:text-gray-700"} transition-all duration-700`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/2 w-full animate-scan opacity-20" />
                  </motion.div>
                </div>

                {/* Audio Visualizer */}
                <div className="mt-6 flex justify-center gap-1 h-6">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: isRecording ? [4, Math.random() * 20 + 4, 4] : 4,
                      }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }}
                      className="w-0.5 bg-emerald-500/30 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-[30px] md:bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 w-full px-10">
            <div className="flex items-center gap-3 bg-white/90 dark:bg-[#0a101f]/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 p-2 rounded-[30px] shadow-2xl transition-all">
              <button 
                onClick={handleSpeakQuestion}
                className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all text-slate-400 dark:text-gray-400 hover:text-emerald-500 relative"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={18} className="text-emerald-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  </>
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              <button
                onClick={handleMicToggle}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isRecording
                    ? "bg-emerald-600 shadow-lg shadow-emerald-500/20"
                    : "bg-red-600 shadow-lg shadow-red-500/20"
                }`}
              >
                {isRecording ? <Square fill="white" size={16} /> : <Mic size={22} className="text-white" />}
              </button>

              <button 
                onClick={() => setShowHint(!showHint)}
                className={`p-4 rounded-full transition-all hover:bg-slate-50 dark:hover:bg-white/5 ${showHint ? "text-indigo-400 dark:text-indigo-400" : "text-slate-400 dark:text-gray-400"}`}
              >
                <MessageSquare size={18} />
              </button>
            </div>

            <button
              onClick={handleEndSession}
              className="px-8 py-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all text-slate-500 dark:text-white/60 shadow-lg"
            >
              Complete Session{" "}
              <ChevronRight size={14} className="text-emerald-500" />
            </button>
          </div>
        </main>

        <NeuralAlert
          isOpen={showAlert}
          type="warning"
          title="Abort Protocol?"
          message="Ending the session now will finalize your current neural progress. Do you wish to proceed?"
          onClose={() => setShowAlert(false)}
          onConfirm={handleEndSession}
        />

        <style>{`
          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(200%); }
          }
          .animate-scan {
            animation: scan 3s linear infinite;
          }
        `}</style>
      </div>
    </PageTransition>
  );
}
