// NoticeCard.tsx
import React, { useState } from 'react';
import {
  Pin,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Download,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotice } from '@/services/auth/context/NoticeContext';
import type { INotice } from '@/types/notice';

const categoryStyles: Record<string, string> = {
  compliance: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  operations: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  marketing: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  hr: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  it: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  memo: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  bulletin: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export const NoticeCard: React.FC<{ notice: INotice }> = ({ notice }) => {
  const {
    currentUserId,
    acknowledgeNotice,
    addComment,
    deleteNotice,
    togglePin,
  } = useNotice();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isAcknowledged = notice.acknowledgedUserIds.includes(currentUserId);
  const badgeStyle = categoryStyles[notice.category] || categoryStyles.memo;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(notice.id, commentText.trim());
    setCommentText('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative bg-zinc-900 border rounded-xl transition-all overflow-hidden ${
        notice.priority === 'urgent'
          ? 'border-red-500/50 shadow-lg shadow-red-950/20'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Priority Ribbon */}
      {notice.priority === 'urgent' && (
        <div className="bg-red-950/80 text-red-400 border-b border-red-900/50 text-[11px] font-semibold tracking-wide uppercase px-5 py-1.5 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Urgent Notice - Mandatory Read
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Header Metadata */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={notice.author.avatar}
              alt={notice.author.name}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-zinc-100">
                  {notice.author.name}
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400">
                  {notice.author.role}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                {formatDistanceToNow(new Date(notice.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium uppercase tracking-wider border ${badgeStyle}`}
            >
              {notice.category}
            </span>
            {notice.pinned && (
              <span
                className="bg-zinc-800 text-zinc-300 border border-zinc-700 p-1.5 rounded-md"
                title="Pinned Announcement"
              >
                <Pin className="w-3.5 h-3.5 fill-current" />
              </span>
            )}
          </div>
        </div>

        {/* Title & Content */}
        <div className="mt-4">
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
            {notice.title}
          </h2>
          <p
            className={`mt-2 text-zinc-300 text-sm leading-relaxed ${!expanded && 'line-clamp-3'}`}
          >
            {notice.content}
          </p>
          {notice.content.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Read full notice
                </>
              )}
            </button>
          )}
        </div>

        {/* Attachments */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap gap-2">
            {notice.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 px-3 py-1.5 rounded-lg text-xs text-zinc-300 transition-colors group"
              >
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="group-hover:text-zinc-100">{att.name}</span>
                <span className="text-zinc-500 text-[11px]">({att.size})</span>
                <Download className="w-3 h-3 text-zinc-500 ml-1" />
              </a>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {notice.requiresAcknowledgment ? (
              <button
                onClick={() => acknowledgeNotice(notice.id)}
                disabled={isAcknowledged}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  isAcknowledged
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default'
                    : 'bg-zinc-100 hover:bg-white text-zinc-900 font-semibold'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}
              </button>
            ) : (
              <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" /> General
                Info
              </span>
            )}

            <button
              onClick={() => setShowComments(!showComments)}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span>{notice.commentsCount} Comments</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePin(notice.id)}
              className="text-zinc-400 hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
              title={notice.pinned ? 'Unpin notice' : 'Pin notice'}
            >
              <Pin
                className={`w-4 h-4 ${notice.pinned ? 'fill-zinc-300 text-zinc-300' : ''}`}
              />
            </button>
            <button
              onClick={() => deleteNotice(notice.id)}
              className="text-zinc-400 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
              title="Delete notice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments Drawer */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-zinc-800 space-y-4"
            >
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or leave feedback..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="submit"
                  className="bg-zinc-100 hover:bg-white text-zinc-900 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>

              <div className="space-y-3">
                {notice.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-zinc-800/40 border border-zinc-800/80 p-3 rounded-lg flex items-start gap-3"
                  >
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-200">
                          {comment.authorName}
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-zinc-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
