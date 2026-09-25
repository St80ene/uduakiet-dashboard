import React, { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UduaKietLogo } from './AppLogo';
import { type IDynamicFaviconProps, BadgeVariant } from '@/types';
import type { IBadgeColors } from '@/interfaces';

const badgeColors: IBadgeColors = {
  danger: '#ef4444', // Red (e.g. Out of stock)
  warning: '#f59e0b', // Amber (e.g. Low stock threshold reached)
  brand: '#06b6d4', // Cyan (e.g. New orders)
};

export const DynamicFavicon: React.FC<IDynamicFaviconProps> = ({
  badgeCount = 0,
  badgeVariant = BadgeVariant.Danger,
  showBackground = true,
}) => {
  // Determine badge color hex based on variant

  const badgeBg = badgeColors[badgeVariant];

  useEffect(() => {
    // 1. Render SVG markup containing the UduaKiet logo + active badge dot
    const svgMarkup = renderToStaticMarkup(
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Render base UduaKiet Logo */}
        <UduaKietLogo
          showBackground={showBackground}
          className="w-full h-full"
        />

        {/* Dynamic Badge Display */}
        {badgeCount > 0 && (
          <g>
            {/* Dark ring outline for high contrast on light & dark browser tabs */}
            <circle cx="24" cy="8" r="6.5" fill="#0f172a" />

            {/* Colored Alert Badge Dot */}
            <circle cx="24" cy="8" r="5" fill={badgeBg} />

            {/* Number Text Overlay */}
            <text
              x="24"
              y="10.2"
              fill="#ffffff"
              fontSize="6.5"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              {badgeCount > 9 ? '9+' : badgeCount}
            </text>
          </g>
        )}
      </svg>,
    );

    // 2. Encode to UTF-8 Data URL
    const faviconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;

    // 3. Inject or replace the <link rel="icon"> in browser <head>
    let link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.type = 'image/svg+xml';
    link.href = faviconUrl;
  }, [badgeCount, badgeVariant, showBackground, badgeBg]);

  return null;
};
