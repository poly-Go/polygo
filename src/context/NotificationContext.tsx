import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'pending';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  bonus?: string;
  txHash?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: number;
  read: boolean;
}

interface NotificationContextType {
  toast: ToastData | null;
  showToast: (data: Omit<ToastData, 'id'>) => void;
  hideToast: () => void;
  // Notification list (bell) support
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  popupMessage: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const showToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ ...data, id });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const addNotification = useCallback((title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setPopupMessage(message);
    setNotifications((prev) => [
      { id, title, message, time: Date.now(), read: false },
      ...prev,
    ].slice(0, 50));
    setTimeout(() => setPopupMessage(null), 3000);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toast,
        showToast,
        hideToast,
        notifications,
        unreadCount,
        addNotification,
        markAllRead,
        markAsRead,
        popupMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx;
};
