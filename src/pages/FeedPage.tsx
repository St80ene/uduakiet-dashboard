// FeedPage.tsx
import React, { useState } from 'react';
import { Megaphone, Flame, Clock } from 'lucide-react';
import { useNotice } from '@/services/auth/context/NoticeContext';
import type { NoticeCategory } from '@/types/notice';
import { NoticeCard } from '@/components/Notices';

export const FeedPage: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const { notices, currentUserId } = useNotice();
  const [selectedCategory, setSelectedCategory] = useState<
    NoticeCategory | 'all'
  >('all');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'urgent'>(
    'all',
  );

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || notice.category === selectedCategory;

    let matchesFilter = true;
    if (filterType === 'pending') {
      matchesFilter =
        notice.requiresAcknowledgment &&
        !notice.acknowledgedUserIds.includes(currentUserId);
    } else if (filterType === 'urgent') {
      matchesFilter = notice.priority === 'urgent';
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const pendingCount = notices.filter(
    (n) =>
      n.requiresAcknowledgment &&
      !n.acknowledgedUserIds.includes(currentUserId),
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-zinc-700/60">
            <Megaphone className="w-3.5 h-3.5 text-zinc-400" /> Pharmacy Chain
            Notice Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">
            Welcome back, Etiene
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            Stay updated with branch compliance guidelines, cold-chain logs,
            inventory audits, and operational bulletins.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-800 p-4 rounded-xl">
          <div className="text-right">
            <div className="text-xs text-zinc-400 font-medium">
              Action Required
            </div>
            <div className="text-lg font-semibold text-zinc-100">
              {pendingCount} Memos Pending
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/60">
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Categories */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {(
            [
              'all',
              'compliance',
              'operations',
              'marketing',
              'hr',
              'it',
              'memo',
              'bulletin',
              'urgent',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick View Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            All Notices
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${filterType === 'pending' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Pending
          </button>
          <button
            onClick={() => setFilterType('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${filterType === 'urgent' ? 'bg-red-950/50 text-red-300 border border-red-900/50' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" /> Urgent Only
          </button>
        </div>
      </div>

      {/* Notice Cards Stream */}
      {filteredNotices.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <Megaphone className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-300">
            No notices found
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search query or category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
};
