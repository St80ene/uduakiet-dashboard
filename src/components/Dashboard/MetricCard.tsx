import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  iconClassName = 'text-sky-600 bg-sky-50',
  valueClassName = 'text-slate-900',
}) => (
  <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </span>

      <div className={`p-2 rounded-lg ${iconClassName}`}>{icon}</div>
    </div>

    <p className={`text-2xl sm:text-3xl font-bold ${valueClassName}`}>
      {value}
    </p>

    <p className="text-[11px] text-slate-500 font-medium mt-2">{description}</p>
  </div>
);

export default MetricCard;
