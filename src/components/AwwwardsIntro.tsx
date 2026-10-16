'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, Shield, Zap } from 'lucide-react';

export default function AwwwardsIntro({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusLogs = [
    'INITIALIZING NEURAL CORE MATRIX...',
    'SYNCING CAIRO SECURE GATEWAY...',
    'ALLOCATING GOOGLE AI PRO 5-ORDER QUOTA...',
    'ESTABLISHING ENCRYPTED PAYMENT PROTOCOLS...',
    'SYSTEM READY • GOOGLE AI PRO EGYPT',
  ];

  useEffect(() => {
    // Check if user already saw intro in this session
    const seen = sessionStorage.getItem('gap_intro_viewed_v1');
    if (seen === 'true') {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // Progress counter animation - Slower, high-precision cinematic pacing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            handleDismiss();
          }, 850);
          return 100;
        }
        // Slower realistic technological jumps
        const jump = Math.random() > 0.4 ? 1 : 2;
        const next = Math.min(100, prev + jump);
        return next;
      });
    }, 65);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 20) setStatusIndex(0);
    else if (progress < 42) setStatusIndex(1);
    else if (progress < 68) setStatusIndex(2);
    else if (progress < 90) setStatusIndex(3);
    else setStatusIndex(4);
  }, [progress]);

  const handleDismiss = () => {
    sessionStorage.setItem('gap_intro_viewed_v1', 'true');
    setVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="awwwards-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: 'blur(10px)',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-[#04060d] text-white flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden select-none cursor-default"
        >
          {/* Kinetic Ambient Rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="w-[600px] h-[600px] rounded-full border border-indigo-500/10 border-dashed pointer-events-none"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="w-[850px] h-[850px] rounded-full border border-purple-500/10 pointer-events-none"
            />
            <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
          </div>

          {/* Top Bar: Brand, Status & Skip */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                <div className="w-full h-full bg-[#04060d] rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
                GOOGLE AI PRO // ARCHITECTURE 2026
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/30 text-xs font-mono text-slate-400 hover:text-white bg-white/5 transition-colors cursor-pointer"
            >
              SKIP INTRO [ESC]
            </button>
          </div>

          {/* Central Holographic Emblem & Title Reveal */}
          <div className="flex flex-col items-center text-center space-y-6 z-10 max-w-xl">
            {/* Holographic Glowing Sphere */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 blur-xl opacity-60"
              />
              <div className="relative w-full h-full rounded-full border border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                <Sparkles className="w-12 h-12 text-indigo-300 animate-pulse" />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-5xl font-black tracking-tight text-white"
              >
                GOOGLE AI PRO
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-xs sm:text-sm font-mono tracking-widest uppercase bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent"
              >
                THE PREMIER INDEPENDENT EGYPTIAN SUBSCRIPTION PORTAL
              </motion.p>
            </div>

            {/* Equalizer Soundwave Visual */}
            <div className="flex items-center gap-1.5 h-6">
              {[12, 24, 16, 28, 14, 22, 10, 26, 18, 12].map((height, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [height * 0.4, height, height * 0.3],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + (i % 3) * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="w-1 rounded-full bg-indigo-400"
                />
              ))}
            </div>
          </div>

          {/* Bottom Bar: Monospace Terminal Feed & Progress Counter */}
          <div className="w-full z-10 space-y-4">
            
            {/* Terminal status line */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-white font-semibold">{statusLogs[statusIndex]}</span>
              </div>
              <span className="text-indigo-400 font-bold">{progress}%</span>
            </div>

            {/* Neon Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Micro Details */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>LOCATION: CAIRO (EG)</span>
              <span>BATCH QUOTA: 5 ORDERS LIMITED</span>
              <span>STATUS: LIVE</span>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
