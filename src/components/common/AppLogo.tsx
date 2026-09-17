import { useId } from 'react';

/**
 * UduaKiet Logo Component
 * "Udua" = Market, "Kiet" = One (Ibibio, Nigeria)
 * Visual Concept:
 * 1. The letter 'U' forms the foundation cup/basket holding inventory.
 * 2. The central dynamic pillar creates the numeral '1' (Kiet - One Hub).
 * 3. Interlocking geometric arrows represent smooth stock flow & upward business speed.
 */
export const UduaKietLogo = ({
  className = 'w-6 h-6',
  variant = 'gradient', // 'gradient' | 'solid' | 'outline' | 'monochrome'
  primaryColor = 'currentColor',
  showBackground = false,
}) => {
  const gradientId = useId();
  const glowId = useId();

  if (variant === 'solid') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="UduaKiet Logo"
      >
        <path
          d="M8 6C8 4.89543 8.89543 4 10 4H13C14.1046 4 15 4.89543 15 6V18C15 19.1046 15.8954 20 17 20H19C20.1046 20 21 19.1046 21 18V13C21 11.8954 21.8954 11 23 11H24C25.1046 11 26 11.8954 26 13V18C26 22.9706 21.9706 27 17 27H15C10.0294 27 6 22.9706 6 18V8C6 6.89543 6.89543 6 8 6Z"
          fill={primaryColor}
        />
        <path
          d="M17 4L23 10H19C17.8954 10 17 9.10457 17 8V4Z"
          fill={primaryColor}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="UduaKiet Logo"
    >
      <defs>
        {/* Main Linear Gradient */}
        <linearGradient
          id={gradientId}
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

        {/* Highlight Accent Gradient */}
        <linearGradient
          id={`${gradientId}-accent`}
          x1="16"
          y1="4"
          x2="28"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {showBackground && <rect width="32" height="32" rx="8" fill="#0f172a" />}

      {/* Main Stylized 'U' + '1' Geometric Path */}
      {/* Outer swoosh forming the Udua market basket & fluid loop */}
      <path
        d="M6.5 7.5C6.5 6.39543 7.39543 5.5 8.5 5.5H11.5C12.6046 5.5 13.5 6.39543 13.5 7.5V17.5C13.5 18.6046 14.3954 19.5 15.5 19.5H17.5C18.6046 19.5 19.5 18.6046 19.5 17.5V13.5C19.5 12.3954 20.3954 11.5 21.5 11.5H23.5C24.6046 11.5 25.5 12.3954 25.5 13.5V17.5C25.5 22.4706 21.4706 26.5 16.5 26.5H15.5C10.5294 26.5 6.5 22.4706 6.5 17.5V7.5Z"
        fill={`url(#${gradientId})`}
      />

      {/* The Central 'Kiet' (One) Upward Dynamic Arrow Accent */}
      <path
        d="M16.5 4.5C16.5 4.5 22.5 4.5 25.5 7.5C25.5 7.5 22.5 10.5 22.5 10.5L16.5 4.5Z"
        fill={`url(#${gradientId}-accent)`}
        opacity="0.9"
      />

      {/* Synchronized Inventory Node Dot (Represents 1 single synchronized market) */}
      <circle cx="23.5" cy="7.5" r="2.25" fill="#38bdf8" />
    </svg>
  );
};
