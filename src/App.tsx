import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Web3Provider } from './context/Web3Context';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { useRefresh } from './hooks/useRefresh';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Referral from './pages/Referral';
import Support from './pages/Support';
import AdminPanel from './components/Admin/AdminPanel';

// ✅ AutoRefresher – ONLY silent functions, NO toasts
function AutoRefresher() {
  const { refreshAllSilent } = useRefresh();

  useEffect(() => {
    // ✅ Refresh on tab focus (silent - NO toast)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAllSilent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ✅ Refresh every 30 seconds (silent - NO toast)
    const interval = setInterval(() => {
      refreshAllSilent();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [refreshAllSilent]);

  return null;
}

function App() {
  return (
    <Web3Provider>
      <NotificationProvider>
        <AutoRefresher />
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 pb-20">
            <Header />
            <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/referral" element={<Referral />} />
                <Route path="/support" element={<Support />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <BottomNav />
            <ToastContainer />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </Web3Provider>
  );
}

export default App;