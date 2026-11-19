import React from 'react';

interface SectionHeadingProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  icon,
}) => (
  <div>
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
      {icon}
      {title}
    </h2>

    {description && (
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    )}
  </div>
);

export default SectionHeading;
