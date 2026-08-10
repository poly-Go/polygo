import { useNotification } from '../../context/NotificationContext';

export const NotificationPopup = () => {
  const { popupMessage } = useNotification();
  if (!popupMessage) return null;
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur px-6 py-3.5 rounded-2xl shadow-xl shadow-purple-500/30 border border-indigo-400 text-white font-semibold text-sm animate-bounce-in flex items-center gap-2.5">
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {popupMessage}
    </div>
  );
};
