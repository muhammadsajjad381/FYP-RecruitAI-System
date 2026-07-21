import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Edit3, Trash2,
  Database, Settings2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Download, RefreshCcw,
  Command, ArrowUpDown, AlertCircle, X, Cpu, Activity, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient";

const CATEGORIES = ["REACT.JS", "NODE.JS", "PYTHON", "JAVASCRIPT", "TYPESCRIPT", "SYSTEM DESIGN", "DOCKER", "AI/ML", "OTHER"];
const DIFFICULTIES = ["Entry", "Intermediate", "Expert"];

const EMPTY_FORM = { text: "", category: "JAVASCRIPT", difficulty: "Intermediate", status: "Active" };

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchQuestions = async () => {
    try {
      setIsRefreshing(true);
      const { data } = await apiClient.get("/questions");
      setQuestions(data.data);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleRefresh = () => fetchQuestions();

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.category || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterCategory === "ALL" || q.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterCategory, questions]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentItems = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (q) => {
    setEditingId(q._id);
    setFormData({ text: q.text, category: q.category, difficulty: q.difficulty, status: q.status });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/questions/${editingId}`, formData);
        Swal.fire({ title: 'MODULE UPDATED!', icon: 'success', background: '#0b111b', color: '#fff', confirmButtonColor: '#10b981' });
      } else {
        await apiClient.post("/questions", formData);
        Swal.fire({ title: 'MODULE DEPLOYED!', icon: 'success', background: '#0b111b', color: '#fff', confirmButtonColor: '#10b981' });
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Operation failed!';
      Swal.fire({ 
        title: 'ERROR', 
        text: errorMsg, 
        icon: 'error', 
        background: '#0b111b', 
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'PURGE MODULE?',
      text: "This question will be permanently removed from the neural bank.",
      icon: 'warning',
      showCancelButton: true,
      background: '#0b111b',
      color: '#fff',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'YES, PURGE',
      cancelButtonText: 'ABORT'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/questions/${id}`);
          setQuestions(prev => prev.filter(q => q._id !== id));
          Swal.fire({ title: 'PURGED!', icon: 'success', background: '#0b111b', color: '#fff', confirmButtonColor: '#10b981' });
        } catch (err) {
          const errorMsg = err.response?.data?.message || err.message || 'Purge failed!';
          Swal.fire({ 
            title: 'ERROR', 
            text: errorMsg, 
            icon: 'error', 
            background: '#0b111b', 
            color: '#fff',
            confirmButtonColor: '#4f46e5'
          });
        }
      }
    });
  };

  const handleToggleStatus = async (q) => {
    const newStatus = q.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiClient.put(`/questions/${q._id}`, { status: newStatus });
      setQuestions(prev => prev.map(item => item._id === q._id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const difficultyColor = (d) => {
    if (d === 'Expert') return 'text-rose-500';
    if (d === 'Intermediate') return 'text-blue-400';
    return 'text-zinc-400';
  };

  const difficultyBars = (d) => {
    const bars = { Entry: 1, Intermediate: 2, Expert: 3 };
    const filled = bars[d] || 1;
    return [1, 2, 3].map(step => (
      <div key={step} className={`h-1 w-3.5 rounded-full ${step <= filled
        ? d === 'Expert' ? 'bg-rose-500' : d === 'Intermediate' ? 'bg-blue-400' : 'bg-zinc-400'
        : 'bg-zinc-800'
        }`} />
    ));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-600 dark:text-zinc-300 font-sans selection:bg-indigo-500/30">
      <div className="relative z-10 max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-slate-200 dark:border-zinc-900 pb-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-emerald-500 shadow-sm dark:shadow-2xl transition-all">
              <Database size={32} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                Neural Question Engine
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Question <span className="text-indigo-600 dark:text-emerald-500">Bank</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-emerald-500/70 mt-1 block italic font-serif">
                Total Modules: {questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-white dark:bg-zinc-900/50 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm">
              <Download size={18} /> Export Protocol
            </button>
            <button
              onClick={openCreate}
              className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-indigo-600 dark:bg-emerald-500 hover:bg-indigo-700 dark:hover:bg-emerald-400 text-white dark:text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> New Module
            </button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-emerald-500 transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search by question content or category..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-800 focus:border-indigo-600 dark:focus:border-emerald-500/40 rounded-2xl py-5 pl-16 pr-6 text-sm font-black text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700 shadow-sm"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              <Command size={12} /> Search
            </div>
          </div>

          <div className="md:col-span-3">
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full h-full bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400 outline-none focus:border-indigo-600 dark:focus:border-emerald-500/40 cursor-pointer appearance-none shadow-sm"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex-1 bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all text-slate-400 dark:text-zinc-500 py-5 shadow-sm"
            >
              <RefreshCcw size={22} className={isRefreshing ? "animate-spin text-indigo-600 dark:text-emerald-500" : ""} />
            </button>
            <button className="flex-1 bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all text-slate-400 dark:text-zinc-500 shadow-sm">
              <Settings2 size={22} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#00050d] border-b border-slate-100 dark:border-zinc-900">
                  <th className="p-8 text-[11px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-2">Question Module <ArrowUpDown size={14} /></div>
                  </th>
                  <th className="p-8 text-[11px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] text-center">Difficulty</th>
                  <th className="p-8 text-[11px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] text-center">Status</th>
                  <th className="p-8 text-[11px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-900">
                <AnimatePresence>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-6"><div className="h-4 bg-zinc-800 rounded w-3/4" /></td>
                        <td className="p-6 text-center"><div className="h-4 bg-zinc-800 rounded w-20 mx-auto" /></td>
                        <td className="p-6 text-center"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto" /></td>
                        <td className="p-6" />
                      </tr>
                    ))
                  ) : currentItems.length > 0 ? (
                    currentItems.map((q, i) => (
                      <motion.tr
                        key={q._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="group transition-all hover:bg-indigo-50/50 dark:hover:bg-emerald-500/[0.01]"
                      >
                        <td className="p-8 max-w-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-tighter">
                              {q._id.substring(0, 6).toUpperCase()}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-emerald-500/10 border border-indigo-100 dark:border-emerald-500/20 text-[9px] font-black text-indigo-600 dark:text-emerald-500 tracking-widest uppercase italic">
                              {q.category}
                            </span>
                          </div>
                          <p className="text-sm font-black text-slate-900 dark:text-zinc-100 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-white transition-colors uppercase tracking-tight">
                            {q.text}
                          </p>
                        </td>
                        <td className="p-8">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <span className={`text-[10px] font-black italic tracking-tighter uppercase ${difficultyColor(q.difficulty)}`}>
                              {q.difficulty} Level
                            </span>
                            <div className="flex gap-1.5">{difficultyBars(q.difficulty)}</div>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleStatus(q)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all cursor-pointer shadow-sm ${
                                q.status === 'Active'
                                  ? 'text-indigo-600 dark:text-emerald-400 bg-white dark:bg-emerald-400/5 border border-indigo-200 dark:border-emerald-400/10 hover:bg-indigo-50 dark:hover:bg-emerald-400/10'
                                  : 'text-slate-400 dark:text-zinc-600 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 hover:text-slate-600 dark:hover:text-zinc-400'
                              }`}
                            >
                              {q.status === 'Active' ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                              {q.status}
                            </button>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                            <button
                              onClick={() => openEdit(q)}
                              className="h-11 w-11 bg-white dark:bg-zinc-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-2xl border border-slate-200 dark:border-zinc-800 transition-all flex items-center justify-center text-slate-400 dark:text-zinc-400 shadow-sm"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(q._id)}
                              className="h-11 w-11 bg-white dark:bg-zinc-900 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl border border-slate-200 dark:border-zinc-800 transition-all flex items-center justify-center shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <div className="flex flex-col items-center gap-6 text-slate-300 dark:text-zinc-600">
                          <AlertCircle size={48} strokeWidth={1.5} />
                          <p className="font-black uppercase tracking-[0.4em] text-[11px] italic">No matching neural modules detected</p>
                          <button
                            onClick={() => { setSearchTerm(""); setFilterCategory("ALL"); }}
                            className="bg-slate-100 dark:bg-zinc-900 px-6 py-2 rounded-full text-indigo-600 dark:text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            Reset Synchronization
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-8 bg-slate-50/50 dark:bg-[#00050d] border-t border-slate-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] italic">
              {currentItems.length} modules active / {filteredQuestions.length} total protocol bank
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:bg-white dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-white transition-all disabled:opacity-20 shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-12 w-12 rounded-2xl font-black text-xs transition-all flex items-center justify-center border ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 dark:bg-emerald-500 border-indigo-600 dark:border-emerald-500 text-white dark:text-black shadow-lg shadow-indigo-500/20 scale-105'
                      : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-white'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:bg-white dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-white transition-all disabled:opacity-20 shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white dark:bg-[#0b111b] border-2 border-indigo-500/20 dark:border-emerald-500/20 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
            >
              <div className="h-auto max-h-[90vh] overflow-y-auto">
                {/* Form */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">
                        {editingId ? 'Update' : 'Deploy'} <span className="text-indigo-600 dark:text-emerald-500">Neural Module</span>
                      </h2>
                      <p className="text-slate-400 dark:text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic">Interview Question Protocol Configuration</p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-white rounded-full transition-all border border-slate-200 dark:border-zinc-800"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] italic">Question Statement</label>
                      <textarea
                        required rows="4"
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 focus:border-indigo-600 dark:focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white text-xs font-bold leading-relaxed transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-800 shadow-inner"
                        placeholder="Define the neural inquiry parameters..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] italic">Domain</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-indigo-600 dark:focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px] uppercase transition-all appearance-none cursor-pointer"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] italic">Complexity</label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-indigo-600 dark:focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px] uppercase transition-all appearance-none cursor-pointer"
                        >
                          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] italic">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-indigo-600 dark:focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px] uppercase transition-all appearance-none cursor-pointer"
                        >
                          <option value="Active">Active Mode</option>
                          <option value="Inactive">Offline Mode</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 border border-slate-200 dark:border-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 dark:text-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all hover:text-slate-900 dark:hover:text-white"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-indigo-600 dark:bg-emerald-500 text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-indigo-500/30 dark:shadow-emerald-500/30 hover:bg-indigo-700 dark:hover:bg-emerald-400 transition-all active:scale-95"
                      >
                        {editingId ? 'Push Update' : 'Initialize'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}