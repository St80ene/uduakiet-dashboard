import React from 'react';
import { motion } from 'framer-motion';
import { UduaKietLogo } from '@/components/common/AppLogo';

export interface LoadingScreenProps {
  /** Text label displayed next to the status pulse indicator */
  label?: string;
  /** Brand subtitle tag (Defaults to Ibibio translation: "One Market") */
  subtitle?: string;
  /** Whether to show the skeleton card layout below the progress bar */
  showSkeleton?: boolean;
  /** Whether to show the status indicator header with pinging dot */
  showStatusHeader?: boolean;
  /** Covers full height of screen if true, or fits parent container if false */
  fullScreen?: boolean;
  /** Custom classes for outer container customization */
  className?: string;
  /** Optional custom content or skeleton override inside the card section */
  children?: React.ReactNode;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  label = 'Loading workspace...',
  subtitle = 'One Market',
  showSkeleton = true,
  showStatusHeader = true,
  fullScreen = true,
  className = '',
  children,
}) => {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 select-none transition-colors duration-300 ${
        fullScreen ? 'min-h-screen' : 'min-h-[400px] h-full'
      } ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xl space-y-6"
      >
        {/* BRAND LOGO & NAME HEADER */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative group">
            {/* Ambient Radial Blur Glow */}
            <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 rounded-3xl blur-xl opacity-50 dark:opacity-60 animate-pulse" />

            {/* Logo Badge Container */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-cyan-500/30 shadow-xl shadow-cyan-500/10"
            >
              <UduaKietLogo className="w-9 h-9" />
            </motion.div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-extrabold tracking-wide text-slate-900 dark:text-white">
              UduaKiet
            </h2>
            {subtitle && (
              <p className="text-[10px] font-semibold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* STATUS HEADER (OPTIONAL) */}
        {showStatusHeader && label && (
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/50 dark:border-slate-800">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {label}
              </span>
            </div>
          </div>
        )}

        {/* INDETERMINATE PROGRESS BAR */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            style={{ width: '50%' }}
          />
        </div>

        {/* SKELETON UI CARD PREVIEW (OPTIONAL) */}
        {showSkeleton && (
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse">
            {children ? (
              children
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-full w-16" />
                </div>

                <div className="space-y-2.5">
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6" />
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
                </div>

                <div className="pt-3 flex gap-3">
                  <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg w-28" />
                  <div className="h-9 bg-slate-100 dark:bg-slate-800/40 rounded-lg w-24" />
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
