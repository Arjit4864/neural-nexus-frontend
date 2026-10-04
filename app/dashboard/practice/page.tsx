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
    // Ignore 'Unknown' when calculating the most common type
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

  // Fetch from the new staffing pipeline backend connected to Neon
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
      console.error("Error fetching pipeline data:", error);
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
      // Give the webhook a moment to process before refreshing the list
      setTimeout(fetchInterviews, 2500); 
    } catch {
      setMessage('An error occurred during sync.');
    }
  };

  const mostCommonType = getMostCommonType(candidates);
  // Grab only the first 5 entries for the preview
  const topCandidates = candidates.slice(0, 5);

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            Command Center
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <motion.button 
              onClick={handleSync} 
              className="rounded-full bg-white/10 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sync Emails
            </motion.button>
            
            <Link href="/dashboard/pipeline">
              <motion.button 
                className="rounded-full bg-indigo-600/80 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-indigo-600/100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Live Pipeline
              </motion.button>
            </Link>

            <Link href="/dashboard/practice">
              <motion.button 
                className="rounded-full bg-purple-500/80 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-purple-500/100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Mock Interview
              </motion.button>
            </Link>
          </div>
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
              {isLoading ? <p className="text-slate-400">Loading timeline...</p> : candidates.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {topCandidates.map(candidate => (
                      <motion.div 
                        key={candidate.id} 
                        className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex justify-between items-center"
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div>
                          <h3 className="font-bold">
                            {candidate.role_title && candidate.role_title !== 'Unknown' ? candidate.role_title : 'Role not specified'} at {candidate.company}
                          </h3>
                          <p className="text-sm text-slate-400">{candidate.interview_date} • {candidate.interview_time}</p>
                        </div>
                        {candidate.interview_type && candidate.interview_type !== 'Unknown' && (
                          <span className="inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                            {candidate.interview_type}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Show More Button */}
                  <div className="pt-2 text-center">
                    <Link 
                      href="/dashboard/pipeline" 
                      className="inline-block px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                      Show More
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-400">No interviews found[cite: 7]. Try syncing your emails.</p>
                  <Link href="/dashboard/pipeline" className="inline-block text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                    Check the Live Pipeline instead &rarr;[cite: 7]
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            className="space-y-6"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <h2 className="text-xl font-semibold">At a Glance[cite: 7]</h2>
                <div className="mt-4 space-y-4">
                  <div>
                      <p className="text-sm text-gray-400">Total Interviews[cite: 7]</p>
                      <p className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">{candidates.length}</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-400">Most Common Type[cite: 7]</p>
                      <p className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">{mostCommonType}</p>
                  </div>
                </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-xl font-semibold">AI Insight[cite: 7]</h2>
              <p className="mt-2 text-sm text-slate-400">
                Analysis indicates a high concentration of <strong className="text-cyan-300">{mostCommonType}</strong> interviews. Recommend preparing STAR method responses and practicing relevant case studies.[cite: 7]
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}