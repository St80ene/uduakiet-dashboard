import type { ApiResponse, BasePaginationParams } from '@/interfaces';

import apiClient from './api';
import type { AuditLogsResponse } from '@/types';

const AUDIT_LOGS_RESOURCE = '/audit-logs';

export const auditLogService = {
  getAllAuditLogs: async (
    params: BasePaginationParams = {},
  ): Promise<AuditLogsResponse> => {
    const response = await apiClient.get(AUDIT_LOGS_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  getAuditLogByID: async (
    auditLogId: string,
  ): Promise<ApiResponse<AuditLogsResponse>> => {
    const response = await apiClient.get<ApiResponse<AuditLogsResponse>>(
      `${AUDIT_LOGS_RESOURCE}/${auditLogId}`,
    );

    return response.data;
  },
};

export const { getAllAuditLogs, getAuditLogByID } = auditLogService;
