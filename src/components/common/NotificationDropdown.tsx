import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Package, AlertCircle, Sparkles, DollarSign, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: any) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onNavigateView }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-emerald-500" />;
      case 'inventory':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'payout':
        return <DollarSign className="w-4 h-4 text-indigo-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleClickItem = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      if (item.link.includes('customer')) onNavigateView('customer-dashboard');
      else if (item.link.includes('seller')) onNavigateView('seller-dashboard');
      else if (item.link.includes('admin')) onNavigateView('admin-dashboard');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        id="notification-dropdown-panel"
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#161616]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              id="notif-mark-all-read-btn"
              onClick={() => markAllAsRead()}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map(item => (
              <button
                key={item.id}
                id={`notif-item-${item.id}`}
                onClick={() => handleClickItem(item)}
                className={`w-full text-left p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-start gap-3 transition-colors ${
                  !item.isRead ? 'bg-zinc-50/70 dark:bg-zinc-800/30' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                )}
              </button>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
