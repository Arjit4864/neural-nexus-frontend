"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AiCoreScene } from './components/AiCore';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <AiCoreScene />
      <motion.div 
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-black/20 p-8 text-center shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <h1 className="bg-gradient-to-br from-white via-cyan-300 to-purple-400 bg-clip-text text-5xl font-extrabold text-transparent">
          Neural Nexus
        </h1>
        <p className="mt-4 text-gray-300">
          An intelligent co-pilot to automate preparation and master your interviews.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <Link 
    href="https://neural-nexus-backend-4qh8.onrender.com/auth/google/login" 
    className="mt-8 inline-flex items-center space-x-3 rounded-full bg-white/10 px-6 py-3 font-bold text-white shadow-lg shadow-white/5 transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:shadow-white/10 backdrop-blur-sm"
  >
    {/* Google Logo */}
    <img 
      src="https://www.google.com/favicon.ico" 
      alt="Google logo" 
      className="h-5 w-5" 
    />
    <span>Sign in with Google</span>
  </Link>
</motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}