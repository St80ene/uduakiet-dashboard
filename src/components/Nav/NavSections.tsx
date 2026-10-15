import { useState, useMemo, type FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Folder } from 'lucide-react';
import type { NavSection } from './NavItems';

export interface NavSectionsProps {
  visibleSections: NavSection[];
}

export const NavSections: FC<NavSectionsProps> = ({ visibleSections }) => {
  const location = useLocation();

  // Find index of section containing the active route
  const activeSectionIndex = useMemo(() => {
    const foundIdx = visibleSections.findIndex((section) =>
      section.items.some((item) => location.pathname.startsWith(item.to)),
    );
    return foundIdx !== -1 ? foundIdx : 0;
  }, [location.pathname, visibleSections]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    activeSectionIndex,
  );

  const toggleSection = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <nav aria-label="Sidebar Navigation" className="space-y-1 p-1">
      {visibleSections.map((section, idx) => {
        const isOpen = expandedIndex === idx;
        const hasActiveChild = section.items.some(
          (item) => location.pathname === item.to,
        );

        return (
          <div
            key={section.label}
            className="rounded-xl overflow-hidden transition-all"
          >
            {/* Category Dropdown Header Trigger */}
            <button
              type="button"
              onClick={() => toggleSection(idx)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                hasActiveChild || isOpen
                  ? 'bg-[#EBEBE2] text-slate-900'
                  : 'text-slate-600 hover:bg-[#EBEBE2]/50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{section.label}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-slate-800' : ''
                }`}
              />
            </button>

            {/* Sub-Items Collapsible Content */}
            {isOpen && (
              <div className="pl-3 pr-1 py-1 space-y-0.5 bg-white/50 rounded-b-xl my-0.5 border border-slate-200/50">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          'flex items-center justify-between',
                          'rounded-lg px-2.5 py-1.5 text-xs font-semibold',
                          'transition-all duration-150',
                          'focus:outline-none focus:ring-1 focus:ring-slate-300',

                          isActive
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900',
                        ].join(' ')
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="ml-1 shrink-0 rounded-full bg-rose-500/10 px-1.5 py-0.2 text-[9px] font-bold text-rose-600">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
