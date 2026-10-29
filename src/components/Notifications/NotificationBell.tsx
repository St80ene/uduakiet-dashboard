import { Bell } from 'lucide-react';
interface NotificationBellProps {
  isNotificationOpen: unknown;
  unreadCount: number;
}

function NotificationBell({
  isNotificationOpen,
  unreadCount,
}: NotificationBellProps) {
  return (
    <div className="notification-icon" style={{ position: 'relative' }}>
      {unreadCount > 0 && (
        <span className="badge bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      <Bell
        className={`w-4 h-4 ${
          isNotificationOpen ? 'text-lime-400' : 'text-slate-600'
        }`}
      />
    </div>
  );
}

export default NotificationBell;
