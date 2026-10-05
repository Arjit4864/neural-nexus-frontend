"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Candidate = {
  id: number;
  role_title: string;
  company: string;
  interview_date: string;
  interview_time: string;
  interview_type: string;
};

const getMostCommonType = (candidates: Candidate[]) => {
  if (candidates.length === 0) return "N/A";
  const counts = candidates.reduce((acc, { interview_type }) => {
    if (interview_type !== 'Unknown') {
      acc[interview_type] = (acc[interview_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const keys = Object.keys(counts);
  if (keys.length === 0) return "N/A";
  return keys.reduce((a, b) => counts[a] > counts[b] ? a : b);
};

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://staffing-pipeline-backend.onrender.com/api/candidates');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCandidates(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching opportunities data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleSync = async () => {
    setMessage('Syncing with email server...');
    try {
      const response = await fetch('https://neural-nexus-backend-4qh8.onrender.com/sync-emails', { 
        method: 'POST',
        credentials: 'include' 
      });
      const data = await response.json();
      setMessage(data.message || 'Sync complete!');
      setTimeout(fetchInterviews, 2500); 
    } catch {
      setMessage('An error occurred during sync.');
    }
  };

  const mostCommonType = getMostCommonType(candidates);
  const topCandidates = candidates.slice(0, 5);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0B] text-slate-200 font-sans p-4 sm:p-6 md:p-8">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl z-10">
        {/* Header Section */}
        <header className="flex flex-col items-start justify-between gap-6 pb-8 border-b border-white/5 md:flex-row md:items-center">
          <div>
            <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-extrabold text-transparent tracking-tight">
              Neural Nexus
            </h1>
            <p className="mt-1 text-sm text-slate-500">Manage your opportunities and prepare for upcoming interviews.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <motion.button 
              onClick={handleSync} 
              className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-5 py-2.5 text-sm font-medium text-slate-300 border border-white/10 shadow-sm transition-all hover:bg-slate-800 hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Sync Emails
            </motion.button>
            
            <Link href="/dashboard/pipeline">
              <motion.button 
                className="rounded-xl bg-indigo-500/10 px-5 py-2.5 text-sm font-medium text-indigo-400 border border-indigo-500/20 shadow-sm transition-all hover:bg-indigo-500/20 hover:text-indigo-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Opportunities
              </motion.button>
            </Link>

            <Link href="/dashboard/practice">
              <motion.button 
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Mock Interview
                </span>
              </motion.button>
            </Link>
          </div>
        </header>
        
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="my-6 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm font-medium text-indigo-300 flex items-center gap-3"
          >
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>
            {message}
          </motion.div>
        )}

        <motion.div 
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Main Timeline Card */}
          <motion.div 
            className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl lg:col-span-2 shadow-2xl"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="border-b border-white/5 p-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h2 className="text-lg font-bold text-white">Upcoming Interviews</h2>
            </div>

            <div className="p-6 flex-1">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5"></div>
                  ))}
                </div>
              ) : candidates.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {topCandidates.map((candidate, i) => (
                      <motion.div 
                        key={candidate.id} 
                        className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/10"
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {candidate.role_title && candidate.role_title !== 'Unknown' ? candidate.role_title : 'Role Not Specified'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400 flex items-center gap-2">
                              <span className="font-medium text-slate-300">{candidate.company}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                              {candidate.interview_date} at {candidate.interview_time}
                            </p>
                          </div>
                          {candidate.interview_type && candidate.interview_type !== 'Unknown' && (
                            <span className="inline-flex w-max items-center rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                              {candidate.interview_type}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {candidates.length > 5 && (
                    <div className="pt-4 text-center">
                      <Link 
                        href="/dashboard/pipeline" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        View all {candidates.length} records
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 p-4 rounded-full bg-white/5 text-slate-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300">No active interviews</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm">We couldn't find any recent interview invites in your inbox. Try syncing your emails or manually checking your opportunities.</p>
                  <Link href="/dashboard/pipeline" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20">
                    Check Full Opportunities
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Side Cards */}
          <motion.div 
            className="flex flex-col gap-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            {/* Stats Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-6">Opportunities</h2>
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Opportunities</p>
                  <p className="mt-1 text-4xl font-black text-white">{candidates.length}</p>
                </div>
                <div className="h-px w-full bg-white/10"></div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Primary Format</p>
                  <p className="mt-1 text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    {mostCommonType}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 backdrop-blur-xl p-6 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 p-3 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-3">AI Intelligence</h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Your opportunities shows a concentration of <strong className="text-purple-400">{mostCommonType}</strong> interviews. 
                <br/><br/>
                Action: We highly recommend running a mock simulator utilizing the STAR method tailored for these specific interaction types to maximize conversion probability.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}