import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Sparkles, LogOut, X, Puzzle, ArrowRight } from 'lucide-react';
import { SideNav } from '../components/Nav/SideNav';
// import { RightActivityPanel } from '../components/Nav/RightActivityPanel';
import { useNotice } from '@/services/auth/context/NoticeContext';
import { useAuth } from '@/services/auth/hooks/useAuth';

export default function AppLayout() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notices, currentUserId } = useNotice();

  const pendingNoticeCount = notices.filter(
    (n) =>
      n.requiresAcknowledgment &&
      !n.acknowledgedUserIds.includes(currentUserId),
  ).length;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F6F0] text-slate-800 font-sans overflow-hidden antialiased">
      {/* 1. Clean Navigation Sidebar */}
      <SideNav />

      {/* 2. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-slate-200/60">
        {/* Top Utility Bar (Notifications, AI Copilot, Logout) */}
        <header className="flex items-center justify-between h-14 px-6 bg-[#F7F6F0] border-b border-slate-200/70 shrink-0 select-none">
          {/* Left Status & AI Copilot */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                Live Inventory Sync
              </span>
            </div>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime-300 hover:bg-lime-400 text-slate-900 border border-slate-900/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>AI Copilot</span>
            </button>
          </div>

          {/* Right Header Controls (Activity & Logout) */}
          <div className="flex items-center gap-2">
            {/* Unified Notification Trigger */}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`
                relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                ${
                  isNotificationOpen
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-[#EBEBE2]'
                }
              `}
              aria-label="Toggle Activity & Alerts Drawer"
            >
              <Bell
                className={`w-4 h-4 ${isNotificationOpen ? 'text-lime-400' : 'text-slate-600'}`}
              />
              <span>Activity</span>
              {pendingNoticeCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingNoticeCount}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 text-xs font-semibold transition-colors cursor-pointer"
              title="Logout Account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. Slide-Out Activity Drawer */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-80 bg-[#F7F6F0] border-l border-slate-200/80 shadow-2xl p-6 space-y-6 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          xl:static xl:z-auto xl:shadow-none
          ${isNotificationOpen ? 'translate-x-0' : 'translate-x-full xl:hidden'}
        `}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Activity & Alerts
            </h3>
          </div>
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* <RightActivityPanel /> */}
      </aside>

      {/* 4. AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#F7F6F0] border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-lime-300 text-slate-900">
                  <Puzzle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Inventory Copilot
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Automated reordering & anomaly detection
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2">
              <p className="text-xs font-medium text-slate-700">
                "3 products are approaching low stock thresholds. Would you like
                to generate purchase orders?"
              </p>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">
                <span>Auto-generate PO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
