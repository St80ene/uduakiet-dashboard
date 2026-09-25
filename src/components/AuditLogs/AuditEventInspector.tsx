import type { IAuditLog } from '@/interfaces/auditlog';
import {
  Activity,
  CheckCircle2,
  History,
  LogIn,
  LogOut,
  Plus,
  RefreshCcw,
  Trash2,
} from 'lucide-react';

interface AuditEventInspectorProps {
  selectedLog: IAuditLog | null;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Logged in',
  LOGOUT: 'Logged out',
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  ARCHIVE: 'Archived',
  RESTORE: 'Restored',
  APPROVE: 'Approved',
  REJECT: 'Rejected',
  RECEIVE: 'Received',
  ADJUST: 'Adjusted',
};

const FIELD_LABELS: Record<string, string> = {
  cost_price: 'Cost price',
  selling_price: 'Selling price',
  stock_quantity: 'Stock quantity',
  reorder_level: 'Reorder level',
  product_name: 'Product name',
  category: 'Category',
  status: 'Status',
  quantity: 'Quantity',
  reason: 'Reason',
  supplier_id: 'Supplier',
  store_id: 'Store',
  role_id: 'Role',
};

const ACTION_ICONS: Record<string, typeof Activity> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: RefreshCcw,
  DELETE: Trash2,
  APPROVE: CheckCircle2,
};

const formatAuditAction = (action: string) => {
  return (
    ACTION_LABELS[action] ??
    action
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const formatAuditField = (field: string) => {
  return (
    FIELD_LABELS[field] ??
    field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const formatAuditValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(
        ([key, nestedValue]) =>
          `${formatAuditField(key)}: ${formatAuditValue(nestedValue)}`,
      )
      .join(', ');
  }

  return String(value);
};

const AuditChanges = ({
  oldValue,
  newValue,
}: {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}) => {
  const oldData = oldValue ?? {};
  const newData = newValue ?? {};

  const fields = Array.from(
    new Set([...Object.keys(oldData), ...Object.keys(newData)]),
  );

  const changedFields = fields.filter(
    (field) =>
      JSON.stringify(oldData[field]) !== JSON.stringify(newData[field]),
  );

  if (changedFields.length === 0) {
    return (
      <div className="p-3 text-[11px] text-slate-500">
        No business or inventory data was changed.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {changedFields.map((field) => (
        <div key={field} className="p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {formatAuditField(field)}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {/* Before */}
            <div className="rounded-md bg-rose-50 border border-rose-100 p-2">
              <p className="text-[9px] uppercase font-medium text-rose-400 mb-1">
                Before
              </p>

              <p className="text-[11px] font-medium text-rose-700 break-words">
                {formatAuditValue(oldData[field])}
              </p>
            </div>

            {/* After */}
            <div className="rounded-md bg-emerald-50 border border-emerald-100 p-2">
              <p className="text-[9px] uppercase font-medium text-emerald-500 mb-1">
                After
              </p>

              <p className="text-[11px] font-medium text-emerald-700 break-words">
                {formatAuditValue(newData[field])}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AuditEventInspector = ({
  selectedLog,
}: AuditEventInspectorProps) => {
  if (!selectedLog) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs h-fit">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
          <History size={14} className="text-purple-600" />
          Audit Event
        </h3>

        <div
          className="
            flex h-48 items-center justify-center
            text-center text-xs text-slate-400
            border border-dashed border-slate-200
            rounded-lg px-6
          "
        >
          Click{' '}
          <span className="font-medium text-slate-500 mx-1">
            "Inspect event"
          </span>
          on any row to see what happened.
        </div>
      </div>
    );
  }

  const ActionIcon = ACTION_ICONS[selectedLog.action] ?? Activity;

  const hasChanges =
    selectedLog.oldValue !== null || selectedLog.newValue !== null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 shadow-2xs h-fit">
      {/* Header */}
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
        <History size={14} className="text-purple-600" />
        Audit Event
      </h3>

      <div className="space-y-4 text-xs">
        {/* ---------------------------------------------------- */}
        {/* Action */}
        {/* ---------------------------------------------------- */}

        <div>
          <p className="text-[10px] text-slate-400 mb-1">Action</p>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600">
                <ActionIcon size={15} />
              </div>

              <div>
                <p className="font-semibold text-slate-700">
                  {formatAuditAction(selectedLog.action)}
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedLog.entity}
                </p>
              </div>
            </div>

            <span className="px-2 py-1 rounded-md bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-semibold">
              {selectedLog.action}
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Entity */}
        {/* ---------------------------------------------------- */}

        <div>
          <p className="text-[10px] text-slate-400 mb-1">Affected Item</p>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="font-medium text-slate-700">{selectedLog.entity}</p>

            <p className="text-[10px] text-slate-400 mt-1 break-all">
              Reference: {selectedLog.entityId}
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Changes */}
        {/* ---------------------------------------------------- */}

        <div>
          <p className="text-[10px] text-slate-400 mb-2">What Changed</p>

          {hasChanges ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <AuditChanges
                oldValue={selectedLog.oldValue}
                newValue={selectedLog.newValue}
              />
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-500">
                This action did not change any business or inventory data.
              </p>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* Metadata */}
        {/* ---------------------------------------------------- */}

        {selectedLog.metadata && (
          <div>
            <p className="text-[10px] text-slate-400 mb-2">
              Additional Details
            </p>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              {Object.entries(selectedLog.metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-slate-400">
                    {formatAuditField(key)}
                  </span>

                  <span className="text-slate-700 font-medium text-right">
                    {formatAuditValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditEventInspector;
