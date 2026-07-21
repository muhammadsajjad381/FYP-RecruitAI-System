import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen bg-[#00050d] flex flex-col items-center justify-center text-center px-4">
      <div className="relative">
        <ShieldAlert size={100} className="text-red-500/20 absolute -top-10 -left-10 animate-pulse" />
        <h1 className="text-[150px] font-black text-white/5 leading-none select-none">404</h1>
      </div>
      
      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mt-[-40px]">
        Access <span className="text-red-500">Denied</span>
      </h2> 

      <p className="text-gray-500 text-xs mt-4 uppercase tracking-[0.3em] font-bold">
        The requested neural path does not exist or is restricted.
      </p>
      
      <Link 
        to="/login" 
        className="mt-10 px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
      >
        Return to Safety
      </Link>
    </div>
  );
}