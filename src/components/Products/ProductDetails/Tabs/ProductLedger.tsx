import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import type { IAuditLog } from '@/interfaces/auditlog';
import DataTable from '@/common/DataTable';
import type { IPaginationMeta } from '@/interfaces';
import type { getAuditLogColumns } from '@/components/AuditLogs/audit_logs_columns';

function ProductLedger({
  auditLogColumns,
  auditLogs,
  meta,
  handleAuditPageChange,
  handleAuditPageSizeChange,
}: {
  auditLogColumns: ReturnType<typeof getAuditLogColumns>;
  auditLogs: IAuditLog[];
  meta: IPaginationMeta;
  handleAuditPageChange: (page: number) => void;
  handleAuditPageSizeChange: (pageSize: number) => void;
}) {
  return (
    <motion.div
      key="ledger"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-900">
              Stock & Price Audit Logs
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical activity for stock adjustments, price changes, and order
            allocations.
          </p>
        </div>
      </div>
      {/* Audit table */}
      <DataTable<IAuditLog>
        records={auditLogs ?? []}
        columns={auditLogColumns}
        meta={meta}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={handleAuditPageChange}
        onPageSizeChange={handleAuditPageSizeChange}
        getRowKey={(log) => log.id}
      />
    </motion.div>
  );
}

export default ProductLedger;
