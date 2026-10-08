import React, { useState, useEffect } from 'react';
import type { INotice } from '@/types/notice';
import { INITIAL_NOTICES } from '@/data/mock_notices';
import { NoticeContext } from './NoticeContext';

export const NoticeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notices, setNotices] = useState<INotice[]>(() => {
    const saved = localStorage.getItem('omni_notice_board_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTICES;
  });

  const currentUserId = 'user-current';

  useEffect(() => {
    localStorage.setItem('omni_notice_board_data', JSON.stringify(notices));
  }, [notices]);

  const addNotice = (
    noticeData: Omit<
      INotice,
      'id' | 'createdAt' | 'acknowledgedUserIds' | 'commentsCount' | 'comments'
    >,
  ) => {
    const newNotice: INotice = {
      ...noticeData,
      id: `notice-${Date.now()}`,
      createdAt: new Date().toISOString(),
      acknowledgedUserIds: [],
      commentsCount: 0,
      comments: [],
    };
    setNotices((prev) => [newNotice, ...prev]);
  };

  const acknowledgeNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.acknowledgedUserIds.includes(currentUserId)) {
          return {
            ...n,
            acknowledgedUserIds: [...n.acknowledgedUserIds, currentUserId],
          };
        }
        return n;
      }),
    );
  };

  const addComment = (noticeId: string, content: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId) {
          const newComment = {
            id: `comment-${Date.now()}`,
            authorName: 'You (Etiene Essenoh)',
            authorAvatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            content,
            createdAt: new Date().toISOString(),
          };
          return {
            ...n,
            commentsCount: n.commentsCount + 1,
            comments: [newComment, ...n.comments],
          };
        }
        return n;
      }),
    );
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  };

  return (
    <NoticeContext.Provider
      value={{
        notices,
        currentUserId,
        addNotice,
        acknowledgeNotice,
        addComment,
        deleteNotice,
        togglePin,
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
};
