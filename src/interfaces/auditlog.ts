import type { ReactNode } from 'react';

export interface IAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  created_at: Date;
  userId: string | null;
  metadata: {
    productName?: string;
    created_at?: string;
    reason?: string;
  };
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
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
  oldValue: unknown;
  newValue: unknown;
}

export interface IValueBoxProps {
  label: string;
  value: string;
  isNew?: boolean;
}
