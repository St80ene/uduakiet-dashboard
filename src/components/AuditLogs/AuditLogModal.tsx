import type { FC } from 'react';
import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock,
  FileText,
  User,
} from 'lucide-react';
import {
  formatExactDateTime,
  formatFieldName,
  formatRelativeTime,
  formatValue,
  getActionStyle,
  getChangedFields,
} from '@/common/utils';
import BaseModal from '@/common/BaseModal';
import type {
  IAuditLogDetailsModalProps,
  IChangeItemProps,
  InfoCardProps,
  IValueBoxProps,
} from '@/interfaces/auditlog';

const AuditLogModal: FC<IAuditLogDetailsModalProps> = ({
  isOpen,
  auditLog,
  onClose,
}) => {
  if (!auditLog) {
    return null;
  }

  const changedFields = getChangedFields(auditLog.oldValue, auditLog.newValue);

  const date = new Date(String(auditLog.created_at));

  return (
    <BaseModal
      isOpen={isOpen}
      title="Audit Details"
      subtitle="Review what changed during this activity."
      onClose={onClose}
      showActions={false}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4
              py-2
              text-xs
              font-semibold
              text-slate-700
              bg-white
              border
              border-slate-200
              rounded-lg
              hover:bg-slate-50
              hover:border-slate-300
              transition-colors
              cursor-pointer
            "
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Activity summary */}
        <div>
          <span
            className={`
              inline-flex
              items-center
              px-2
              py-1
              rounded-md
              border
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${getActionStyle(auditLog.action)}
            `}
          >
            {auditLog.action}
          </span>

          <h4 className="mt-3 text-sm font-semibold text-slate-900">
            {auditLog.metadata?.productName ?? 'Product activity'}
          </h4>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {auditLog.metadata?.reason ?? 'Product information was updated.'}
          </p>
        </div>

        {/* Activity metadata */}
        <div className="grid grid-cols-2 gap-3">
          {/* Timestamp */}
          <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />

              <span className="text-[10px] uppercase font-semibold tracking-wide">
                Activity time
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-700 mt-1">
              {formatRelativeTime(date)}
            </p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {formatExactDateTime(date)}
            </p>
          </div>

          <InfoCard
            icon={<User className="w-3.5 h-3.5" />}
            label="Performed by"
            value={auditLog.userId ? auditLog.userId.substring(0, 8) : 'System'}
          />

          <InfoCard
            icon={<FileText className="w-3.5 h-3.5" />}
            label="Entity"
            value={auditLog.entity}
          />
        </div>

        {/* Changes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Changes</h4>

              <p className="text-xs text-slate-500 mt-0.5">
                {changedFields.length > 0
                  ? `${changedFields.length} field${
                      changedFields.length === 1 ? '' : 's'
                    } changed`
                  : 'No field-level changes detected'}
              </p>
            </div>
          </div>

          {changedFields.length > 0 ? (
            <div className="space-y-3">
              {changedFields.map((change) => (
                <ChangeItem
                  key={change.field}
                  field={change.field}
                  oldValue={change.oldValue}
                  newValue={change.newValue}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <Check className="w-5 h-5 text-slate-400 mx-auto mb-2" />

              <p className="text-xs font-medium text-slate-600">
                No changes to display
              </p>
            </div>
          )}
        </div>

        {/* Reason */}
        {auditLog.metadata?.reason && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />

              <div>
                <h4 className="text-xs font-semibold text-amber-900">
                  Activity reason
                </h4>

                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {auditLog.metadata.reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

const InfoCard: FC<InfoCardProps> = ({ icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-slate-400">
      {icon}

      <span className="text-[10px] uppercase font-semibold tracking-wide">
        {label}
      </span>
    </div>

    <p className="text-xs font-medium text-slate-700 mt-1 truncate">{value}</p>
  </div>
);

const ChangeItem: FC<IChangeItemProps> = ({ field, oldValue, newValue }) => {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-800">
          {formatFieldName(field)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4">
        <ValueBox label="Before" value={formatValue(oldValue)} />

        <ArrowRight className="w-4 h-4 text-slate-300 mt-5" />

        <ValueBox label="After" value={formatValue(newValue)} isNew />
      </div>
    </div>
  );
};

const ValueBox: FC<IValueBoxProps> = ({ label, value, isNew = false }) => (
  <div className="min-w-0">
    <p
      className={`
        text-[10px]
        uppercase
        font-semibold
        tracking-wide
        mb-1.5
        ${isNew ? 'text-emerald-600' : 'text-slate-400'}
      `}
    >
      {label}
    </p>

    <div
      className={`
        rounded-lg
        border
        px-3
        py-2
        min-h-9
        ${
          isNew
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-slate-200 bg-slate-50'
        }
      `}
    >
      <p
        className={`
          text-xs
          break-words
          ${isNew ? 'text-emerald-700 font-medium' : 'text-slate-600'}
        `}
      >
        {value}
      </p>
    </div>
  </div>
);

export default AuditLogModal;
