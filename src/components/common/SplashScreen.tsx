import React from 'react';
import { UduaKietLogo } from '../Nav/AppLogo';

/**
 * UduaKiet Splash Screen Component
 * Minimalist design featuring only the Logo, Brand Name, and Tagline.
 */
export const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-6 text-white select-none">
      <style>{`
        @keyframes slideIndeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>

      <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-8 text-center">
        {/* BRAND LOGO */}
        <div className="relative group">
          {/* Ambient Radial Glow Background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 rounded-3xl blur-2xl opacity-60 animate-pulse" />

          {/* Icon Badge */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            <UduaKietLogo className="w-14 h-14" />
          </div>
        </div>

        {/* BRAND NAME & TAGLINE */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-wider text-white">
            UduaKiet
          </h1>
          <p className="text-xs font-medium tracking-widest uppercase text-cyan-400">
            One Market
          </p>
        </div>

        {/* ELEGANT INDETERMINATE PROGRESS ACCENT */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full w-1/2"
            style={{
              animation: 'slideIndeterminate 1.6s infinite ease-in-out',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
