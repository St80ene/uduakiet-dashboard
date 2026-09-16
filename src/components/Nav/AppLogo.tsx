import React from 'react';

export const UduaKietLogo: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background Rounded Shield / Tile */}
    <rect width="32" height="32" rx="8" className="fill-cyan-500/10" />

    {/* Outer Market Boundary (Connecting Lines) */}
    <path
      d="M8 12L16 7L24 12V21C24 22.6569 22.6569 24 21 24H11C9.34315 24 8 22.6569 8 21V12Z"
      className="stroke-cyan-400"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* "Kiet" Central Node / Core Unity Point */}
    <circle cx="16" cy="16" r="3" className="fill-cyan-400" />

    {/* Convergence Rays (Symbolizing Bringing Markets into One) */}
    <path
      d="M16 11V13M16 19V21M11 16H13M19 16H21"
      className="stroke-cyan-400"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
