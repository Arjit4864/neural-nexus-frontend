"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Candidate {
  id: number;
  company: string;
  interview_date: string;
  interview_time: string;
  role_title: string;
  interview_type: string;
  created_at: string;
}

export default function PipelineDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('https://staffing-pipeline-backend.onrender.com/api/candidates');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data.success) {
          setCandidates(data.data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
    const intervalId = setInterval(fetchCandidates, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.role_title && c.role_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [candidates, searchTerm]);

  const upcomingCount = candidates.length; 
  const actionRequiredCount = candidates.filter(c => c.interview_date === 'Unknown').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Recruiter Intelligence</h1>
            <p className="text-xs text-gray-500">Live sync active • Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700">
            &larr; Back to Command Center
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            <strong>Connection Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Total Pipeline</h3>
            <p className="text-3xl font-bold text-white mt-2">{candidates.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Upcoming Interviews</h3>
            <p className="text-3xl font-bold text-indigo-400 mt-2">{upcomingCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Missing Details</h3>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{actionRequiredCount}</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
          <input 
            type="text" 
            placeholder="Search by company or role..." 
            className="bg-gray-950 border border-gray-800 text-sm rounded-lg px-4 py-2 w-72 focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="h-64 bg-gray-900 rounded-xl w-full border border-gray-800 animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/50 border-b border-gray-800">
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Target Role</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Schedule</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Format</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500">No candidates match your search.</td>
                  </tr>
                ) : (
                  filteredCandidates.map(candidate => (
                    <tr key={candidate.id} className="hover:bg-gray-800/40 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{candidate.company}</div>
                        <div className="text-sm text-indigo-400 mt-0.5">
                          {candidate.role_title && candidate.role_title !== 'Unknown' ? candidate.role_title : 'Role not specified'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300 font-medium">{candidate.interview_date}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{candidate.interview_time}</div>
                      </td>
                      <td className="p-4 space-y-2">
                        <span className="block w-max px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Scheduled
                        </span>
                        {candidate.interview_type && candidate.interview_type !== 'Unknown' && (
                          <span className="block w-max px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {candidate.interview_type}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/dashboard/practice?company=${encodeURIComponent(candidate.company)}&role=${encodeURIComponent(candidate.role_title)}&type=${encodeURIComponent(candidate.interview_type)}`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all inline-block shadow-lg shadow-indigo-500/20"
                        >
                          Launch Prep AI
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}