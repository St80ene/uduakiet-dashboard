import type { IAuditLog } from '@/interfaces/auditlog';
import type { IDataTableColumn } from '@/interfaces/data_table';

export const getAuditLogColumns = (
  onViewChanges: (log: IAuditLog) => void,
): IDataTableColumn<IAuditLog>[] => [
  {
    key: 'date',
    header: 'Date',
    render: (log) => (
      <div>
        <div className="text-xs font-medium text-slate-700">
          {new Date(log.created_at).toLocaleDateString()}
        </div>

        <div className="text-[10px] text-slate-400 mt-0.5">
          {new Date(log.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    ),
  },

  {
    key: 'action',
    header: 'Action',
    render: (log) => {
      const actionStyles: Record<string, string> = {
        CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
        DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
        DEACTIVATE: 'bg-amber-50 text-amber-700 border-amber-200',
      };

      return (
        <span
          className={`
            inline-flex items-center
            px-2 py-1
            rounded-md
            border
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            ${
              actionStyles[log.action] ??
              'bg-slate-50 text-slate-600 border-slate-200'
            }
          `}
        >
          {log.action}
        </span>
      );
    },
  },

  {
    key: 'entity',
    header: 'Entity',
    render: (log) => (
      <span className="text-xs font-medium text-slate-700">{log.entity}</span>
    ),
  },

  {
    key: 'reason',
    header: 'Activity',
    render: (log) => (
      <div className="max-w-[280px]">
        <p className="text-xs text-slate-700 truncate">
          {log.metadata?.reason ?? 'No reason provided'}
        </p>

        {log?.userId ? (
          <p className="text-[10px] text-slate-400 mt-0.5">
            User: {log?.userId?.substring(0, 8)}
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 mt-0.5">
            System / Unknown user
          </p>
        )}
      </div>
    ),
  },
  {
    key: 'changes',
    header: '',
    headerClassName: 'text-right',
    cellClassName: 'text-right',
    render: (log) => (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onViewChanges(log);
        }}
        className="
          px-3 py-1.5
          text-xs font-semibold
          text-slate-700
          bg-white
          border border-slate-200
          rounded-lg
          hover:bg-slate-50
          hover:border-slate-300
          transition-colors
          cursor-pointer
        "
      >
        View changes
      </button>
    ),
  },
];
