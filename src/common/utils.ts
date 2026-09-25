import { UomType, type UomDisplayName } from '@/enum/product';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatQuantity = (
  quantity: number,
  uomType: UomType,
  displayName: UomDisplayName,
): string => {
  if (uomType === UomType.WEIGHT || uomType === UomType.VOLUME) {
    const convertedQuantity = quantity / 1000;

    return `${convertedQuantity.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} ${displayName}`;
  }

  return `${quantity.toLocaleString()} ${displayName}`;
};

export const getChangedFields = (
  oldValue: Record<string, unknown> | null,
  newValue: Record<string, unknown> | null,
) => {
  if (!oldValue || !newValue) {
    return [];
  }

  const fields = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

  return Array.from(fields)
    .filter(
      (field) =>
        JSON.stringify(oldValue[field]) !== JSON.stringify(newValue[field]),
    )
    .map((field) => ({
      field,
      oldValue: oldValue[field],
      newValue: newValue[field],
    }));
};

export const formatFieldName = (field: string) =>
  field.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length
      ? `${value.length} item${value.length === 1 ? '' : 's'}`
      : 'None';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

export const getActionStyle = (action: string) => {
  const styles: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',

    DELETE: 'bg-rose-50 text-rose-700 border-rose-200',

    DEACTIVATE: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return styles[action] ?? 'bg-slate-50 text-slate-600 border-slate-200';
};

/**
 * Displays a relative timestamp that is easy to scan.
 *
 * Examples:
 * - Just now
 * - 5 minutes ago
 * - 3 hours ago
 * - Yesterday
 * - 4 days ago
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Displays the exact timestamp for audit precision.
 *
 * Example:
 * Friday, August 28, 2026 at 11:25 PM
 */
export const formatExactDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
};

// export const copyToClipboard = (
//   text: string,
//   label: string,
//   setToast: ({}) => void,
// ) => {
//   navigator.clipboard.writeText(text);
//   setToast({ message: `Copied ${label} to clipboard!`, type: 'info' });
//   // setToast({ message: `Copied ${label} to clipboard!`, type: 'info' });
//   setTimeout(() => setToast(null), 3000);
// };

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;

  const aKeys = Object.keys(aRecord);
  const bKeys = Object.keys(bRecord);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(bRecord, key) &&
      deepEqual(aRecord[key], bRecord[key]),
  );
}

export function getFieldDiffs<T extends object>(
  original: T,
  current: Partial<T>,
): Partial<T> {
  const changes: Partial<T> = {};

  for (const key of Object.keys(current) as Array<keyof T>) {
    if (!deepEqual(original[key], current[key])) {
      changes[key] = current[key];
    }
  }

  return changes;
}
