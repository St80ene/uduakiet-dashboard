import React, { useState } from 'react';
import { Search, ArrowUpDown, Filter, FileText, Code2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { AuditLog } from '@/interfaces/auditlog';
import type { AuditLogsResponse } from '@/types';

import { getAuditLogColumns } from './audit_logs_columns';
import { auditLogService } from '@/services/audit_logs.service';
import useDebouncedValue from '@/hooks/debounceHook';

import DataTable from '../common/DataTable';
import { LoadingScreen } from '../common/Error/LoadingScreen';
import { ErrorPage } from '../common/Error/ErrorPage';

export const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Pagination state
  // ---------------------------------------------------------------------------

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);

  // ---------------------------------------------------------------------------
  // Search & Sort state
  // ---------------------------------------------------------------------------

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // ---------------------------------------------------------------------------
  // Selected audit log
  // ---------------------------------------------------------------------------

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // ---------------------------------------------------------------------------
  // Debounced search
  // ---------------------------------------------------------------------------

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // ---------------------------------------------------------------------------
  // Fetch audit logs
  // ---------------------------------------------------------------------------

  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<AuditLogsResponse>({
      queryKey: [
        'audit_logs',
        {
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          sortOrder,
        },
      ],

      queryFn: () =>
        auditLogService.getAllAuditLogs({
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          sortOrder,
        }),

      placeholderData: (previousData) => previousData,
    });

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  const handleViewChanges = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    setPage(1);
  };

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------

  const columns = getAuditLogColumns(handleViewChanges);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <LoadingScreen label="Fetching system audit logs..." />;
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load audit logs"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading audit log records.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => navigate('/dashboard')}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Page
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          System Audit Logs
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Review immutable system activity, entity changes, and database state
          differences.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Content */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------------------------------------------------------------- */}
        {/* Audit Logs Table */}
        {/* ---------------------------------------------------------------- */}

        <div className="lg:col-span-2">
          <DataTable<AuditLog>
            records={data?.audit_logs || []}
            columns={columns}
            meta={data?.meta}
            isLoading={isLoading}
            isPlaceholderData={isPlaceholderData}
            getRowKey={(record: AuditLog) => record.id}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSelectRecord={handleViewChanges}
            getRowClassName={(record: AuditLog) =>
              record.id === selectedLog?.id ? 'bg-purple-50/50' : ''
            }
            emptyState={{
              icon: <FileText className="w-7 h-7 text-slate-400" />,
              title: 'No audit logs found',
              description:
                'No system activity records match your current search or filter.',
            }}
            header={
              <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* ------------------------------------------------------ */}
                {/* Search */}
                {/* ------------------------------------------------------ */}

                <div className="relative w-full sm:w-80">
                  <label htmlFor="audit-log-search" className="sr-only">
                    Search Audit Logs
                  </label>

                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                  <input
                    id="audit-log-search"
                    type="search"
                    placeholder="Search audit logs..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="
                      w-full pl-9 pr-3 py-1.5 text-xs font-normal
                      text-slate-800 placeholder:text-slate-400
                      bg-slate-50/50 border border-slate-200
                      rounded-lg outline-none
                      focus:bg-white focus:ring-2
                      focus:ring-slate-300 focus:border-slate-300
                      transition-all
                    "
                  />
                </div>

                {/* ------------------------------------------------------ */}
                {/* Sort */}
                {/* ------------------------------------------------------ */}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
                    <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Sort by:
                    </span>

                    <select
                      aria-label="Select sort field"
                      value={selectedSort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="
                        bg-transparent text-xs text-slate-700
                        font-medium outline-none cursor-pointer pr-1
                      "
                    >
                      <option value="created_at">Date Created</option>
                      <option value="updated_at">Date Updated</option>
                      <option value="entity">Entity</option>
                      <option value="action">Action</option>
                    </select>

                    <button
                      type="button"
                      onClick={toggleSortOrder}
                      aria-label={`Sort direction ${sortOrder}`}
                      className="
                        p-1 hover:bg-slate-200/60 rounded
                        text-slate-600 transition-colors cursor-pointer
                      "
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Diff Inspector */}
        {/* ---------------------------------------------------------------- */}

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 shadow-2xs h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Code2 size={14} className="text-purple-600" />
            Diff Inspector
          </h3>

          {selectedLog ? (
            <div className="space-y-4 text-xs">
              {/* -------------------------------------------------------- */}
              {/* Entity Details */}
              {/* -------------------------------------------------------- */}

              <div>
                <p className="text-[10px] text-slate-400 mb-1">
                  Entity Details
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px]">
                  <div className="font-medium">{selectedLog.entity}</div>

                  <div className="text-slate-400 mt-0.5 break-all">
                    {selectedLog.entityId}
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* Old Value */}
              {/* -------------------------------------------------------- */}

              <div>
                <p className="text-[10px] text-slate-400 mb-1">
                  Previous State
                </p>

                <pre
                  className="
                  p-2.5 rounded-lg
                  bg-slate-50 border border-slate-200
                  font-mono text-[11px] text-rose-600
                  overflow-x-auto max-h-72
                  whitespace-pre-wrap break-words
                "
                >
                  {selectedLog.oldValue !== null &&
                  selectedLog.oldValue !== undefined
                    ? JSON.stringify(selectedLog.oldValue, null, 2)
                    : 'null'}
                </pre>
              </div>

              {/* -------------------------------------------------------- */}
              {/* New Value */}
              {/* -------------------------------------------------------- */}

              <div>
                <p className="text-[10px] text-slate-400 mb-1">Updated State</p>

                <pre
                  className="
                  p-2.5 rounded-lg
                  bg-slate-50 border border-slate-200
                  font-mono text-[11px] text-emerald-600
                  overflow-x-auto max-h-72
                  whitespace-pre-wrap break-words
                "
                >
                  {selectedLog.newValue !== null &&
                  selectedLog.newValue !== undefined
                    ? JSON.stringify(selectedLog.newValue, null, 2)
                    : 'null'}
                </pre>
              </div>
            </div>
          ) : (
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
                "View changes"
              </span>
              on any row to inspect the state differences.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
