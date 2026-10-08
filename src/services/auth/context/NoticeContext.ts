import type { INotice } from '@/types/notice';
import { createContext, useContext } from 'react';

export interface NoticeContextType {
  notices: INotice[];
  currentUserId: string;
  addNotice: (
    noticeData: Omit<
      INotice,
      'id' | 'createdAt' | 'acknowledgedUserIds' | 'commentsCount' | 'comments'
    >,
  ) => void;
  acknowledgeNotice: (id: string) => void;
  addComment: (noticeId: string, content: string) => void;
  deleteNotice: (id: string) => void;
  togglePin: (id: string) => void;
}

export const NoticeContext = createContext<NoticeContextType | undefined>(
  undefined,
);

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotice must be used within NoticeProvider');
  return context;
};
