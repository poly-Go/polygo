import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Referral from './pages/Referral';
import Support from './pages/Support';
import AdminPanel from './components/Admin/AdminPanel';
import { AdminRoute } from './components/Layout/AdminRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/support" element={<Support />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
