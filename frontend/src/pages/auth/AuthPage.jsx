import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Github,
  ArrowRight,  
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
  
export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'Admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [userInfo, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      
      const { data } = await apiClient.post(endpoint, payload);
      
      // Specifically log the success for debugging
      console.log(`${mode} successful:`, data);

      login(data.data);

      // Role-based navigation
      const userRole = data.data.role;
      if (userRole === 'Admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      if (!err.response) {
        setError("Network error: Backend server is not running or unreachable.");
      } else {
        setError(err.response?.data?.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-[#00050d] text-zinc-300 font-sans flex relative overflow-hidden">
      {/* --- BACKGROUND ART (Matched to Dashboard) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      </div>

      {/* --- Right SIDE --- */}
      <div className="flex-1 flex items-center justify-center z-10 px-6 lg:px-12">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-left-6 duration-700">
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-white">
              Recruit<span className="text-emerald-500">AI</span>
            </h1>
            <p className="text-zinc-600 font-black text-[9px] uppercase tracking-[0.3em] mt-2 italic">
              Neural Screening Protocol
            </p>
          </div>
    
          {/* Form Container (Matched to Dashboard Cards) */}
          <div className="bg-[#0b111b]/50 border border-zinc-800 backdrop-blur-xl p-7 rounded-[30px] shadow-2xl relative">
            {/* Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === "login"
                    ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === "signup"
                    ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-black p-3 rounded-xl text-center">
                  {error}
                </div>
              )}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors"
                      size={16}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Sajjad"
                      value={name}
                      onChange={(e) => setName(e.target.value.toUpperCase())}
                      className="w-full bg-black/40 border border-zinc-800 py-3.5 pl-11 pr-4 rounded-xl outline-none focus:border-emerald-500/40 transition-all font-bold text-sm text-white placeholder:text-zinc-800"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Work Email
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors"
                    size={16}
                  />
                  <input
                    type="email"
                    required
                    placeholder="NAME@RECRUIT.AI"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-black/40 border border-zinc-800 py-3.5 pl-11 pr-4 rounded-xl outline-none focus:border-emerald-500/40 transition-all font-bold text-sm text-white placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors"
                    size={16}
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 py-3.5 pl-11 pr-4 rounded-xl outline-none focus:border-emerald-500/40 transition-all font-bold text-sm text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 mt-2 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : (mode === "login" ? "Authenticate" : "Initialize Account")}
                {!loading && <ArrowRight size={14} strokeWidth={3} />}
              </button>
            </form>

            {/* Social Auth */}
            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-zinc-900/50 border border-zinc-800 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all group">
                <Github
                  size={18}
                  className="text-zinc-500 group-hover:text-white"
                />
              </button>
              <button className="flex-1 bg-zinc-900/50 border border-zinc-800 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">
                  Google
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Visual matched to Dashboard Accuracy/Stats) */}
      <div className="hidden lg:flex flex-[0.8] bg-[#05070a] border-l border-zinc-900 items-center justify-center relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-emerald-600/5 blur-[120px] rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-72 h-72 flex items-center justify-center mb-12">
            <div className="absolute inset-0 border-t-2 border-b-2 border-emerald-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
            <div className="absolute inset-6 border border-dashed border-zinc-800 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
            <div className="absolute inset-12 bg-emerald-500/5 blur-3xl animate-pulse"></div>

            {/* Shield Icon Matched to Neural Accuracy Color */}
            <div className="relative z-20 bg-[#0b111b] p-6 rounded-[35px] border border-zinc-800 backdrop-blur-md shadow-[0_0_50px_rgba(16,185,129,0.1)] animate-[bounce_3s_ease-in-out_infinite]">
              <ShieldCheck
                size={50}
                className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="text-center px-10">
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.9] mb-6 italic">
              <span className="block text-white">Neural</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-600 animate-gradient-x">
                Mastery
              </span>
            </h2>

            <div className="flex flex-col items-center gap-4">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
              <p className="text-zinc-500 font-bold text-xs leading-relaxed max-w-[280px] uppercase tracking-widest opacity-80 italic">
                The most advanced <span className="text-white">AI-driven</span>{" "}
                screening engine. Validating talent with neural precision.
              </p>
            </div>

            <div className="mt-10 flex gap-8 justify-center opacity-40">
              <div className="text-center">
                <p className="text-lg font-black text-white leading-none">99.8%</p>
                <p className="text-[8px] font-black uppercase tracking-tighter mt-1 text-emerald-500">
                  Accuracy
                </p>
              </div>
              <div className="w-[1px] h-8 bg-zinc-800"></div>
              <div className="text-center">
                <p className="text-lg font-black text-white leading-none">0.2s</p>
                <p className="text-[8px] font-black uppercase tracking-tighter mt-1 text-blue-500">
                  Latency
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}