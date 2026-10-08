import type { ReactNode } from 'react';

export interface IAuditMetaData {
  reason: string;
  [key: string]: unknown;
}
export interface IAuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  created_at: Date;
  user_id: string | null;
  metadata: IAuditMetaData;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
}

export interface IAuditLogDetailsModalProps {
  isOpen: boolean;
  auditLog: IAuditLog | null;
  onClose: () => void;
}

export interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export interface IChangeItemProps {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

export interface IValueBoxProps {
  label: string;
  value: string;
  isNew?: boolean;
}
