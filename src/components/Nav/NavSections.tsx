import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from './NavItems';

export interface NavSectionsProps {
  items: NavItem[];
  label: string;
}

export const NavSections: FC<{ visibleSections: NavSectionsProps[] }> = ({
  visibleSections,
}) => {
  return (
    <nav aria-label="Sidebar" className="space-y-3.5 p-2.5">
      {visibleSections.map((section) => (
        <div key={section.label}>
          {/* Section heading */}
          <div className="mb-1 px-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {section.label}
            </p>
          </div>

          {/* Navigation items */}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center justify-between',
                      'rounded-md',
                      'px-2.5 py-1.5',
                      'text-xs font-medium',
                      'transition-all duration-150',
                      'focus:outline-none focus:ring-1 focus:ring-cyan-500',

                      isActive
                        ? 'border border-cyan-500/30 bg-cyan-950/40 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200',
                    ].join(' ')
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-bold text-cyan-400">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};
