"use client";
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PracticeSimulator() {
  const searchParams = useSearchParams();
  const company = searchParams.get('company');
  const role = searchParams.get('role');
  const interviewType = searchParams.get('type');

  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const { transcript, isListening, startListening, stopListening, setTranscript } = useSpeechRecognition();

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsGenerating(true);
      try {
        const response = await fetch('https://neural-nexus-backend-4qh8.onrender.com/interviews/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: company || "Unknown",
            role: role || "Unknown",
            interview_type: interviewType || "Unknown"
          })
        });
        
        const data = await response.json();
        
        if (response.ok && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          speakQuestion(data.questions[0]);
        } else {
          throw new Error(data.error || "Failed to load questions");
        }
      } catch (error) {
        console.error("Failed to fetch custom questions:", error);
        // Fallback to static questions if the AI fails
        const fallback = [
          "Tell me about a time you faced a difficult challenge at work.",
          "Where do you see yourself in five years?",
          "What is your biggest weakness?",
          "Why should we hire you?",
          "Describe a time you showed leadership."
        ];
        setQuestions(fallback);
        speakQuestion(fallback[0]);
      } finally {
        setIsGenerating(false);
      }
    };

    fetchQuestions();
  }, [company, role, interviewType]);

  const speakQuestion = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handleNextQuestion = () => {
    stopListening();
    setFeedback('');
    setTranscript('');
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    setCurrentQuestionIndex(nextIndex);
    speakQuestion(questions[nextIndex]);
  };

  const getAIFeedback = async () => {
    if (isListening) stopListening();
    if (!transcript) {
        setFeedback("Please record an answer first.");
        return;
    };
    setIsLoadingFeedback(true);
    setFeedback('');

    try {
      const response = await fetch('https://neural-nexus-backend-4qh8.onrender.com/interviews/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: questions[currentQuestionIndex],
          answer: transcript,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred on the server.");
      }
      setFeedback(data.feedback);
   } catch (error: unknown) {
      console.error("Failed to get AI feedback:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setFeedback(`Error: ${errorMessage}. Check the backend terminal for details.`);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            Mock Interview Simulator
          </h1>
          <Link href="/dashboard/pipeline" className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-white/20">
            Back to Pipeline
          </Link>
        </div>
        
        <motion.div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 text-center min-h-[150px] flex flex-col justify-center">
          {isGenerating ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-white/20 rounded w-1/4 mx-auto"></div>
              <div className="h-6 bg-cyan-900/50 rounded w-3/4 mx-auto"></div>
              <p className="text-sm text-cyan-400 mt-2">Generating personalized technical questions...</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-300">{questions[currentQuestionIndex]}</p>
              {(role && role !== "Unknown") && (
                <span className="mt-4 inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30">
                  Target: {role} @ {company}
                </span>
              )}
            </>
          )}
        </motion.div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Column 1: Control Buttons */}
          <div className="flex flex-col space-y-4">
            <button 
              onClick={isListening ? stopListening : startListening} 
              disabled={isGenerating}
              className={`w-full rounded-full p-4 text-lg font-bold transition-colors duration-200 
                ${isListening 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? 'Stop Recording' : 'Record Answer'}
            </button>
            <button 
              onClick={getAIFeedback} 
              disabled={isListening || isLoadingFeedback || isGenerating} 
              className="w-full rounded-full bg-purple-500/80 p-4 text-lg font-semibold transition hover:bg-purple-500/100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingFeedback ? 'Analyzing...' : 'Get AI Feedback'}
            </button>
            <div className="flex gap-4">
              <button 
                onClick={() => speakQuestion(questions[currentQuestionIndex])} 
                disabled={isGenerating}
                className="flex-1 rounded-full bg-white/10 p-3 font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Repeat Question
              </button>
              <button 
                onClick={handleNextQuestion} 
                disabled={isGenerating}
                className="flex-1 rounded-full bg-white/10 p-3 font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Question
              </button>
            </div>
          </div>
          
          {/* Column 2: Transcript and AI Feedback */}
          <div className="flex flex-col space-y-6">
            <div className="min-h-[250px] rounded-2xl border border-white/10 bg-black/20 p-4 text-slate-300">
              <p className="font-semibold">Your transcribed answer:</p>
              <p className="mt-2 text-sm italic">{transcript || 'Your answer will appear here...'}</p>
            </div>
            
            {(isLoadingFeedback || feedback) && (
              <motion.div 
                className="rounded-2xl border border-white/10 bg-black/20 p-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <h2 className="text-xl font-semibold text-cyan-300">AI Feedback 💡</h2>
                <div className="prose prose-invert mt-2 max-w-none text-slate-300 leading-relaxed">
                  {isLoadingFeedback ? "Analyzing your answer..." : <div dangerouslySetInnerHTML={{ __html: (feedback || "").replace(/\n/g, '<br />') }} />}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Next.js strictly requires useSearchParams() to be wrapped in Suspense
export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-semibold animate-pulse">Initializing Simulator...</div>
      </div>
    }>
      <PracticeSimulator />
    </Suspense>
  );
}