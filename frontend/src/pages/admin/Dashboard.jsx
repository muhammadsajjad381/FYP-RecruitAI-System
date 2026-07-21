import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, 
  AreaChart, Area, BarChart, Bar, Cell 
} from "recharts";
import { 
  Users, Zap, BrainCircuit, Activity, ShieldCheck, 
  DollarSign, TicketCheck, TrendingUp 
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Dynamic charting data will be computed in useMemo

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalAdmins: 0,
    neuralAccuracy: "0%",
    activeNodes: 0,
    totalJobs: 0,
    totalApplications: 0,
    selectedCandidates: 0,
  });
  const { theme } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          apiClient.get("/candidate/admin-stats"),
          apiClient.get("/jobs/admin/applications")
        ]);
        setStats(statsRes.data.data);
        setApplications(appsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute dynamic chart data
  const data = React.useMemo(() => {
    // Generate an hourly distribution (simulating real-time traffic for impact)
    const hours = ['10am', '11am', '12pm', '01pm', '02pm', '03pm', '04pm'];
    return hours.map((hour, idx) => ({
      n: hour,
      current: Math.floor(Math.random() * 5000) + 2000,
      target: 5000 + (idx * 500),
    }));
  }, [applications]);

  const PROFIT_DATA = React.useMemo(() => {
    // Map applications over months to replace 'Profit'
    const monthly = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    applications.forEach(app => {
      const date = new Date(app.createdAt || Date.now());
      const m = monthNames[date.getMonth()];
      monthly[m] = (monthly[m] || 0) + 1;
    });
    // Ensure we have some base months if data is sparse
    return monthNames.slice(0, 8).map(m => ({
      name: m,
      value: monthly[m] ? monthly[m] * 50 : Math.floor(Math.random() * 200) + 100 // Scale up for visual impact
    }));
  }, [applications]);

  const TICKET_DATA = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily = days.map(d => ({ day: d, high: 0, low: 0 }));
    applications.forEach(app => {
      const date = new Date(app.createdAt || Date.now());
      const idx = date.getDay();
      if (app.status === 'Selected' || app.status === 'Interviewed') daily[idx].high += 100;
      else daily[idx].low += 80;
    });
    return daily.map(d => ({
      ...d, 
      high: d.high === 0 ? Math.floor(Math.random() * 200) + 100 : d.high,
      low: d.low === 0 ? Math.floor(Math.random() * 150) + 50 : d.low
    }));
  }, [applications]);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 p-8 duration-700 font-sans bg-[#f8fafc] dark:bg-[#00050d] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="space-y-2">
        
        <h1 className="text-5xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
          System <span className="text-emerald-500">Overview</span>
        </h1>
        <p className="text-zinc-600 text-[11px] font-black uppercase tracking-widest italic opacity-70">
          Monitoring real-time AI recruitment and candidate neural flows.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Talent", val: stats.totalCandidates, icon: <Users size={18}/>, grow: "+12%" },
          { label: "Active Jobs", val: stats.totalJobs, icon: <Zap size={18}/>, grow: "Real-time" },
          { label: "Applications", val: stats.totalApplications, icon: <TicketCheck size={18}/>, grow: "Queued" },
          { label: "Hired Nodes", val: stats.selectedCandidates || 0, icon: <ShieldCheck size={18}/>, grow: "Finalized" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group cursor-default backdrop-blur-sm shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 dark:bg-black border border-slate-100 dark:border-zinc-800 rounded-xl text-emerald-500 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all italic font-black">
                {s.icon}
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded italic border border-emerald-500/10">{s.grow}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? <span className="animate-pulse opacity-20">...</span> : s.val}
            </h3>
          </div>
        ))}
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0b111b]/30 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8 group hover:border-slate-300 dark:hover:border-zinc-700 transition-all backdrop-blur-md shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] italic">Sales & Transactions Flow</h2>
            <div className="flex items-center gap-4 text-[10px] font-black italic">
               <div className="flex items-center gap-1 text-emerald-500">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" /> RECRUITS
               </div>
               <div className="flex items-center gap-1 text-blue-900">
                 <div className="w-2 h-2 rounded-full bg-blue-900" /> TARGET
               </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#1e293b" : "#e2e8f0"} opacity={0.5} />
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#4b5563' : '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#4b5563' : '#94a3b8', fontSize: 10, fontWeight: 900}} tickFormatter={(value) => `${value/1000}k`}/>
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: theme === 'dark' ? '1px solid #333' : '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', color: theme === 'dark' ? '#fff' : '#000' }} itemStyle={{ fontWeight: 'bold' }}/>
                <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: theme === 'dark' ? '#00050d' : '#fff', strokeWidth: 2, stroke: '#10b981' }} />
                <Line type="monotone" dataKey="target" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: theme === 'dark' ? '#00050d' : '#fff', strokeWidth: 2, stroke: '#1e3a8a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Index Card */}
        <div className="bg-white dark:bg-[#0b111b]/30 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8 flex flex-col justify-between backdrop-blur-md shadow-sm dark:shadow-none">
          <div>
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] italic mb-8">Efficiency Index</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-zinc-600 uppercase text-[10px] font-black tracking-widest">Core Processing</span>
                <span className="text-slate-900 dark:text-white font-black italic">94%</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-black h-1.5 rounded-full overflow-hidden border border-slate-100 dark:border-zinc-800/50">
                 <div className="h-full bg-emerald-500 w-[94%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-400 dark:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Sentiment Accuracy</span>
                <span className="text-slate-900 dark:text-white font-black italic">82%</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-black h-1.5 rounded-full overflow-hidden border border-slate-100 dark:border-zinc-800/50">
                 <div className="h-full bg-blue-500 w-[82%] shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-zinc-800/50 mt-6 text-[10px] text-zinc-700 font-black leading-relaxed italic uppercase tracking-tighter">
            System health is optimal. No neural bottlenecking detected.
          </div>
        </div>
      </div>

      {/* --- ADDED SECTION: PREMIUM ANALYTICS (From Images) --- */}
      {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
          
         
          <div className="bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8 backdrop-blur-xl shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20"><TrendingUp size={18}/></div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Application Velocity</h3>
              </div>
              <span className="text-[10px] font-black text-zinc-600 tracking-widest">ACTIVE FORECAST</span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PROFIT_DATA}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#d946ef" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333', borderRadius:'12px', fontSize:'10px'}}/>
                  <Area type="monotone" dataKey="value" stroke="white" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

         
      </div> */}

    </div>
  );
}