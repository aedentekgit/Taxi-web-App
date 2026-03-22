import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { PageLoader } from './components/Spinner.jsx';

// Pages
import Login         from './pages/Login.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import CabBookings   from './pages/CabBookings.jsx';
import Intercity     from './pages/Intercity.jsx';
import Rental        from './pages/Rental.jsx';
import RentalPackages from './pages/RentalPackages.jsx';
import Customers     from './pages/Customers.jsx';
import Drivers       from './pages/Drivers.jsx';
import Employees     from './pages/Employees.jsx';
import Roles         from './pages/Roles.jsx';
import Finance       from './pages/Finance.jsx';
import Support       from './pages/Support.jsx';
import SOS           from './pages/SOS.jsx';
import Coupons       from './pages/Coupons.jsx';
import DriverIncentives from './pages/DriverIncentives.jsx';
import Packages      from './pages/Packages.jsx';
import Destinations  from './pages/Destinations.jsx';
import Services      from './pages/Services.jsx';
import Settings      from './pages/Settings.jsx';
import Pricing       from './pages/Pricing.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  );
}

import { useEffect } from 'react';
import { settingsAPI } from './api/index.js';

export default function App() {
  useEffect(() => {
    settingsAPI.getPublic().then(res => {
      const data = res.data?.data;
      if (data) {
        const root = document.documentElement;
        if (data.primary_color) root.style.setProperty('--orange', data.primary_color);
        if (data.secondary_color) root.style.setProperty('--sidebar', data.secondary_color);
        if (data.accent_color) root.style.setProperty('--green', data.accent_color);
      }
    }).catch(err => console.error('Failed to apply theme config:', err));
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/bookings" element={<AppLayout><CabBookings /></AppLayout>} />
      <Route path="/intercity" element={<AppLayout><Intercity /></AppLayout>} />
      <Route path="/rental" element={<AppLayout><Rental /></AppLayout>} />
      <Route path="/rental-packages" element={<AppLayout><RentalPackages /></AppLayout>} />
      <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
      <Route path="/drivers" element={<AppLayout><Drivers /></AppLayout>} />
      <Route path="/employees" element={<AppLayout><Employees /></AppLayout>} />
      <Route path="/roles" element={<AppLayout><Roles /></AppLayout>} />
      <Route path="/finance" element={<AppLayout><Finance /></AppLayout>} />
      <Route path="/support" element={<AppLayout><Support /></AppLayout>} />
      <Route path="/sos" element={<AppLayout><SOS /></AppLayout>} />
      <Route path="/coupons" element={<AppLayout><Coupons /></AppLayout>} />
      <Route path="/incentives" element={<AppLayout><DriverIncentives /></AppLayout>} />
      <Route path="/packages" element={<AppLayout><Packages /></AppLayout>} />
      <Route path="/destinations" element={<AppLayout><Destinations /></AppLayout>} />
      <Route path="/services" element={<AppLayout><Services /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="/pricing" element={<AppLayout><Pricing /></AppLayout>} />
      <Route path="/admin/pricing" element={<Navigate to="/pricing" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
