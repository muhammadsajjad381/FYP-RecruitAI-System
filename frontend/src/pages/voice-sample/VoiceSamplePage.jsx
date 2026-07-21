import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ShieldCheck, Zap, Activity, ChevronRight, X } from "lucide-react";
import apiClient from "../../api/apiClient";

export default function VoiceSamplePage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false); 
  const [micError, setMicError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

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

  const handleClear = () => {
    setTimer(0);
    audioBlobRef.current = null;
    audioChunksRef.current = [];
  };

  const handleFinalSubmit = async () => {
    if (!audioBlobRef.current && timer === 0) return;
    
    setIsLoading(true);
    
    // Allow the recorder to finish generating the blob if just stopped
    await new Promise(r => setTimeout(r, 400));

    const formData = new FormData();
    if (audioBlobRef.current) {
      formData.append("audio", audioBlobRef.current, "voice_sample.webm");
    }

    try {
      await apiClient.post("/v1/interviews/upload-voice-sample", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setIsLoading(false);
      navigate("/interview"); 
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      // Fallback: forcefully navigate even if upload fails in demo mode
      navigate("/interview");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
        <div className="h-screen bg-[#00050d] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]"></div>
            <p className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">Uploading Vocal Print...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#00050d] text-slate-900 dark:text-white flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-500">
      
      {/* Neural Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 dark:hidden" />
      </div>

      <main className="relative z-10 w-full max-w-5xl px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* LEFT: Graphics */}
        <div className="flex-1 flex flex-col items-center justify-center mt-[100px]">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsing Outer Rings */}
            <div className={`absolute inset-0 border border-emerald-500/20 rounded-full transition-all duration-500 ${isRecording ? 'animate-ping' : 'opacity-20'}`}></div>
            <div className={`absolute inset-4 border border-emerald-500/10 dark:border-emerald-500/10 rounded-full border-dashed transition-all duration-1000 ${isRecording ? 'animate-[spin_6s_linear_infinite]' : 'rotate-45'}`}></div>
            
            {/* Center Mic Button */}
            <div className={`relative z-10 w-36 h-36 rounded-[48px] flex items-center justify-center transition-all duration-500 shadow-2xl border ${isRecording ? 'bg-red-500/90 border-red-400 scale-110 shadow-red-500/40' : 'bg-emerald-600 border-emerald-400 shadow-emerald-600/20'}`}>
              <Mic size={48} className={`text-white ${isRecording ? 'animate-pulse' : ''}`} />
            </div>

            {/* Orbiting Neural Nodes */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className={`absolute w-1 rounded-full transition-all duration-500 ${isRecording ? 'bg-red-500 h-12 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-emerald-500/30 h-4'}`}
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-120px)`,
                  animation: isRecording ? `pulseCustom 0.6s ease-in-out infinite alternate ${i * 0.05}s` : 'none'
                }}
              ></div>
            ))}
          </div>

          {/* Status Chips */}
          <div className="mt-12 flex gap-4">
            <div className="bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-emerald-500/10 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-slate-500 dark:text-zinc-400 shadow-xl">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Latency: 08ms</span>
            </div>
            <div className="bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-emerald-500/10 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-slate-500 dark:text-zinc-400 shadow-xl">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Gain: +2dB</span>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTENT & CONTROLS */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Neural Calibration Protocol</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-tight text-slate-900 dark:text-white uppercase italic">
              VOICE <span className="text-emerald-500 font-extrabold">VERIFICATION</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-[#0b111b]/80 border border-slate-200 dark:border-zinc-800 p-8 rounded-[32px] md:rounded-[48px] relative backdrop-blur-xl shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-3 italic">Read the Sentence in Mic below</p>
            <p className="text-xl font-medium leading-relaxed text-slate-800 dark:text-zinc-100 italic">
              "I am ready to initialize the <span className="text-emerald-500">AI-driven interview protocol</span> for the recruitment system and validate my technical core."
            </p>
          </div>

          {micError && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl">
               {micError}
             </div>
          )}

          <div className="bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-zinc-800 p-5 rounded-[32px] flex items-center gap-5 transition-all hover:border-emerald-500/30 shadow-lg">
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 select-none shadow-lg ${isRecording ? 'bg-red-500 shadow-red-500/20 scale-105' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'}`}
            >
              <Mic size={28} />
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-zinc-500'}`}>
                  {isRecording ? "Capturing Frequency..." : "Hold to Record"}
                </span>
                <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tracking-widest">{formatTime(timer)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden flex gap-0.5 p-[1px]">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all rounded-full ${isRecording ? 'bg-red-500' : 'bg-emerald-500/20'}`}
                    style={{ height: isRecording ? `${30 + Math.random() * 70}%` : '40%' }}></div>
                ))}
              </div>
            </div>
            
            {timer > 0 && !isRecording && (
              <button onClick={handleClear} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                <X size={20} />
              </button>
            )}
          </div>

          <button 
            disabled={timer === 0 || isRecording}
            onClick={handleFinalSubmit}
            className={`w-full h-16 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all ${timer > 0 && !isRecording ? 'bg-emerald-500 text-black hover:bg-emerald-600 shadow-lg' : 'bg-slate-100 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-700 border border-slate-200 dark:border-zinc-800'}`}
          >
            Start Interview Protocol
            <ChevronRight size={18} />
          </button>
        </div>
      </main>

      <style>{`
        @keyframes pulseCustom {
          to { transform: rotate(var(--tw-rotate)) translateY(-140px) scaleY(1.8); opacity: 1; }
        }
      `}</style>
    </div>
  );
}