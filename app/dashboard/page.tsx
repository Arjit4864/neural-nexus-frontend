"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Interview = {
  id: number;
  role_title: string;
  company_name: string;
  interview_date: string;
  interview_type: string;
};

const getMostCommonType = (interviews: Interview[]) => {
  if (interviews.length === 0) return "N/A";
  const counts = interviews.reduce((acc, { interview_type }) => {
    acc[interview_type] = (acc[interview_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://neural-nexus-backend-4qh8.onrender.com/interviews', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setInterviews(data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
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
      setTimeout(fetchInterviews, 2000); 
    } catch {
      setMessage('An error occurred during sync.');
    }
  };

  const mostCommonType = getMostCommonType(interviews);

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            Command Center
          </h1>
          <motion.button 
            onClick={handleSync} 
            className="rounded-full bg-white/10 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sync Emails
          </motion.button>
          <Link href="/dashboard/practice">
  <motion.button 
    className="rounded-full bg-purple-500/80 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-purple-500/100"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    Start Mock Interview
  </motion.button>
</Link>
        </header>
        
        {message && <p className="my-4 rounded-md bg-black/20 p-3 text-center text-sm text-cyan-300">{message}</p>}

        <motion.div 
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Main Timeline Card */}
          <motion.div 
            className="rounded-2xl border border-white/10 bg-black/20 p-6 md:col-span-2"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h2 className="text-xl font-semibold">Interview Timeline</h2>
            <div className="mt-4 space-y-4">
              {isLoading ? <p className="text-slate-400">Loading timeline...</p> : interviews.length > 0 ? (
                <AnimatePresence>
                  {interviews.map(interview => (
                    <motion.div 
                      key={interview.id} 
                      className="rounded-xl border border-slate-700 bg-slate-800/50 p-4"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="font-bold">{interview.role_title} at {interview.company_name}</h3>
                      <p className="text-sm text-slate-400">{new Date(interview.interview_date).toLocaleString()}</p>
                      <span className="mt-2 inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">{interview.interview_type}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : <p className="text-slate-400">No interviews found. Try syncing your emails.</p>}
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            className="space-y-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <h2 className="text-xl font-semibold">At a Glance</h2>
                <div className="mt-4 space-y-4">
                  <div>
                      <p className="text-sm text-gray-400">Total Interviews</p>
                      <p className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">{interviews.length}</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-400">Most Common Type</p>
                      <p className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">{mostCommonType}</p>
                  </div>
                </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-xl font-semibold">AI Insight</h2>
              <p className="mt-2 text-sm text-slate-400">
                Analysis indicates a high concentration of <strong className="text-cyan-300">{mostCommonType}</strong> interviews. Recommend preparing STAR method responses and practicing relevant case studies.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}