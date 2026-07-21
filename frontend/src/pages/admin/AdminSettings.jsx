import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Database, Globe, Users, 
  Activity, Server, HardDrive, Key, Trash2,
  RefreshCcw, Save, ArrowLeft, BarChart3, Search, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  
  // --- Tab State (Isse Tabs kaam karengi) ---
  const [activeTab, setActiveTab] = useState("Platform Data");

  const handleApply = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await apiClient.get("/users");
      setUsers(data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "User Control") {
      fetchUsers();
    }
  }, [activeTab]);

  const handlePromote = async (id) => {
    try {
      await apiClient.patch(`/users/${id}/role`, { role: 'Admin' });
      Swal.fire({ title: 'USER PROMOTED', icon: 'success', background: 'transparent', backdrop: 'rgba(0,0,0,0.8)' });
      fetchUsers();
    } catch (err) {
      Swal.fire({ title: 'ERROR', text: 'Failed to promote user.', icon: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    Swal.fire({
      title: 'DELETE USER?',
      text: "This will permanently remove the user from the neural records.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, DELETE'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/users/${id}`);
          setUsers(users.filter(u => u._id !== id));
          Swal.fire('DELETED!', '', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to delete user.', 'error');
        }
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const inputStyle = "w-full bg-slate-50 dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 p-3 rounded-xl focus:border-green-500 outline-none transition-all text-[13px] text-slate-900 dark:text-gray-200 placeholder:text-slate-300 dark:placeholder:text-gray-700 font-medium shadow-sm dark:shadow-inner";
  const labelStyle = "text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-gray-500 mb-2.5 block ml-0.5";

  // --- Render Function for Tabs ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "Platform Data":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-green-500 flex items-center gap-3"><Server size={16}/> Infrastructure Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div><label className={labelStyle}>Primary Node Endpoint</label><input type="text"  defaultValue="https://api.recruitai-core.v1" className={inputStyle} /></div>
              <div><label className={labelStyle}>Database Sync Interval (ms)</label><input type="number" defaultValue="5000" className={inputStyle} /></div>
              <div className="md:col-span-2"><label className={labelStyle}>Global Admin Notification Email</label><input type="email" defaultValue="root@recruit.ai" className={inputStyle} /></div>
            </div>
          </motion.div>
        );
      case "User Control":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-green-500 flex items-center gap-3"><Users size={16}/> User Management</h3>
            <div className="p-4 bg-slate-50 dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 rounded-2xl flex items-center gap-4 shadow-sm">
              <Search size={18} className="text-slate-400 dark:text-gray-600" />
              <input 
                type="text" 
                placeholder="Search user by Name or Email..." 
                className="bg-transparent outline-none text-sm w-full text-slate-900 dark:text-white font-medium" 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <div className="border border-slate-100 dark:border-gray-800 rounded-2xl overflow-hidden text-[12px] shadow-sm bg-white dark:bg-transparent">
              <div className="bg-slate-50 dark:bg-gray-900/50 p-4 grid grid-cols-4 font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest border-b border-slate-100 dark:border-gray-800">
                <span>User</span> 
                <span>Role</span> 
                <span>Join Date</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 dark:divide-gray-800">
                {loadingUsers ? (
                  <div className="p-10 text-center text-slate-300 animate-pulse font-black uppercase text-[10px] tracking-widest">Accessing Neural Database...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-10 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">No users detected in sector.</div>
                ) : filteredUsers.map((user) => (
                  <div key={user._id} className="p-4 grid grid-cols-4 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-600 font-mono">{user.email}</span>
                    </div>
                    <span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${user.role === 'Admin' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {user.role}
                      </span>
                    </span>
                    <span className="text-slate-400 dark:text-gray-500 font-black text-[10px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex justify-end gap-2 text-right">
                       {user.role !== 'Admin' && (
                         <button onClick={() => handlePromote(user._id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm" title="Promote to Admin">
                            <ShieldCheck size={14} />
                         </button>
                       )}
                       <button onClick={() => handleDeleteUser(user._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete User">
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case "AI Engine":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-green-500 flex items-center gap-3"><Activity size={16}/> AI Analysis Protocols</h3>
            <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
              <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Model Version: GPT-4-Neural-Turbo</p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 italic">"The AI engine is currently optimizing candidate scores based on tech-stack relevance."</p>
            </div>
            <div><label className={labelStyle}>Analysis Sensitivity (0.1 - 1.0)</label><input type="range" className="w-full accent-green-500" /></div>
          </motion.div>
        );
      case "API Keys":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-green-500 flex items-center gap-3"><Key size={16}/> Integrated Services</h3>
            <div className="space-y-4">
              <div><label className={labelStyle}>OpenAI API Key</label><input type="password" defaultValue="sk-proj-****************" className={inputStyle} /></div>
              <div><label className={labelStyle}>Cloudinary Secret</label><input type="password" defaultValue="CLD-4492-********" className={inputStyle} /></div>
            </div>
          </motion.div>
        );
      default:
        return <div className="text-gray-500 italic">Interface under construction...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-500 dark:text-gray-200 font-sans selection:bg-green-500/30">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-8 py-4 rounded-[10px] flex items-center gap-3 font-black shadow-[0_0_30px_rgba(34,197,94,0.3)] text-[11px] uppercase tracking-widest"
          >
            <ShieldCheck size={16} /> Protocols Synchronized
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto py-8 px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-gray-800/50 pb-12">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 dark:text-gray-500 hover:text-green-500 transition-colors mb-6 group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[3px]">Admin Dashboard</span>
            </button>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
              Global <span className="text-green-500 not-italic">Console</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/5 rounded-full border border-green-500/20">
            <ShieldAlert size={14} className="text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500 italic">Auth: Root Access</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar Tabs (Logic Applied) */}
          <div className="lg:col-span-3 space-y-2">
             <p className="text-[10px] font-black text-slate-300 dark:text-gray-700 uppercase tracking-[4px] mb-6 pl-4">Registry</p>
             {[
               { icon: <Database size={16} />, label: "Platform Data" },
               { icon: <Users size={16} />, label: "User Control", restricted: true },
               { icon: <Activity size={16} />, label: "AI Engine" },
               { icon: <Key size={16} />, label: "API Keys", restricted: true }
             ].filter(item => !item.restricted || userInfo?.role === 'SuperAdmin').map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[10px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.label ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-white/5'}`}
                >
                   {item.icon} {item.label}
                </button>
             ))}
          </div>

          {/* Dynamic Content Panel */}
          <div className="lg:col-span-9 bg-white dark:bg-[#0b111b]/30 p-10 rounded-3xl border border-slate-100 dark:border-gray-800/50 min-h-[500px] shadow-sm dark:shadow-none">
             {renderTabContent()}

             {/* Commit Changes Button */}
             <div className="mt-16 pt-10 border-t border-slate-100 dark:border-gray-800/50">
                <button 
                  onClick={handleApply}
                  className="px-12 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-500 transition-all text-[11px] uppercase tracking-[3px] shadow-lg shadow-green-900/20 active:scale-95"
                >
                  Commit All Changes
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}