import React from 'react';

/**
 * UduaKiet SVG Logo Component
 * "Udua" = Market, "Kiet" = One (Ibibio, Nigeria)
 */
export const UduaKietLogo: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="UduaKiet Logo"
    >
      <defs>
        <linearGradient
          id="udua-splash-grad"
          x1="2"
          y1="2"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan 500 */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* Blue 500 */}
          <stop offset="100%" stopColor="#6366f1" /> {/* Indigo 500 */}
        </linearGradient>
        <linearGradient
          id="udua-splash-accent"
          x1="16"
          y1="4"
          x2="28"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* Main Stylized 'U' + '1' Geometric Path */}
      <path
        d="M6.5 7.5C6.5 6.39543 7.39543 5.5 8.5 5.5H11.5C12.6046 5.5 13.5 6.39543 13.5 7.5V17.5C13.5 18.6046 14.3954 19.5 15.5 19.5H17.5C18.6046 19.5 19.5 18.6046 19.5 17.5V13.5C19.5 12.3954 20.3954 11.5 21.5 11.5H23.5C24.6046 11.5 25.5 12.3954 25.5 13.5V17.5C25.5 22.4706 21.4706 26.5 16.5 26.5H15.5C10.5294 26.5 6.5 22.4706 6.5 17.5V7.5Z"
        fill="url(#udua-splash-grad)"
      />

      {/* Central Arrow Accent */}
      <path
        d="M16.5 4.5C16.5 4.5 22.5 4.5 25.5 7.5C25.5 7.5 22.5 10.5 22.5 10.5L16.5 4.5Z"
        fill="url(#udua-splash-accent)"
        opacity="0.9"
      />

      {/* Sync Node Dot */}
      <circle cx="23.5" cy="7.5" r="2.25" fill="#38bdf8" />
    </svg>
  );
};

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
