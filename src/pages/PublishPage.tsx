// PublishPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ShieldAlert } from 'lucide-react';
import type { NoticeCategory, NoticePriority } from '@/types/notice';
import { useNotice } from '@/services/auth/context/NoticeContext';

interface FormInputs {
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  targetAudience:
    | 'all'
    | 'store-staff'
    | 'pharmacists'
    | 'inventory'
    | 'sales'
    | 'hr'
    | 'it'
    | 'executives';
  requiresAcknowledgment: boolean;
  pinned: boolean;
}

export const PublishPage: React.FC = () => {
  const { addNotice } = useNotice();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      category: 'operations',
      priority: 'normal',
      targetAudience: 'all',
      requiresAcknowledgment: false,
      pinned: false,
    },
  });

  const onSubmit = (data: FormInputs) => {
    addNotice({
      ...data,
      author: {
        name: 'Etiene Essenoh',
        role: 'Operations Lead',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      attachments: [
        {
          name: 'Branch_Protocol_Guidelines_2026.pdf',
          size: '1.4 MB',
          url: '#',
        },
      ],
    });
    navigate('/notices/feeds');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/')}
        className="text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Notice Feed
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <div className="mb-6 pb-6 border-b border-zinc-800">
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-zinc-400" />
            Publish Company Announcement
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Broadcast operational updates, cold-chain compliance directives, or
            store notices across branches.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
              Notice Title
            </label>
            <input
              type="text"
              placeholder="e.g. URGENT: Cold Chain Protocol Verification across All Branches"
              {...register('title', { required: 'Title is required' })}
              className="w-full bg-zinc-800 border border-zinc-700/80 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            {errors.title && (
              <span className="text-xs text-red-400 mt-1 block">
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full bg-zinc-800 border border-zinc-700/80 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="compliance">Compliance & QA</option>
                <option value="operations">Store Operations</option>
                <option value="marketing">Marketing & Promo</option>
                <option value="hr">Human Resources</option>
                <option value="it">IT & Systems</option>
                <option value="memo">Memorandum</option>
                <option value="bulletin">Bulletin</option>
                <option value="urgent">Urgent Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                Priority Level
              </label>
              <select
                {...register('priority')}
                className="w-full bg-zinc-800 border border-zinc-700/80 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent / Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <select
                {...register('targetAudience')}
                className="w-full bg-zinc-800 border border-zinc-700/80 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="all">Entire Company</option>
                <option value="store-staff">Store Staff & Cashiers</option>
                <option value="pharmacists">Pharmacists & Dispensers</option>
                <option value="inventory">Inventory & Supply Chain</option>
                <option value="sales">Sales & Commercial</option>
                <option value="hr">Human Resources</option>
                <option value="it">IT Support</option>
                <option value="executives">Leadership & Executives</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
              Notice Body Content
            </label>
            <textarea
              rows={6}
              placeholder="Provide full details, audit steps, or branch instructions here..."
              {...register('content', { required: 'Content is required' })}
              className="w-full bg-zinc-800 border border-zinc-700/80 rounded-lg p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            {errors.content && (
              <span className="text-xs text-red-400 mt-1 block">
                {errors.content.message}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('requiresAcknowledgment')}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-zinc-900 focus:ring-0"
              />
              <span className="text-xs font-medium text-zinc-300">
                Require mandatory staff read acknowledgment
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('pinned')}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-zinc-900 focus:ring-0"
              />
              <span className="text-xs font-medium text-zinc-300">
                Pin to top of feed
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-zinc-100 hover:bg-white text-zinc-900 px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
