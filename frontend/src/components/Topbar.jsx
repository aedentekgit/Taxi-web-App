import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LABELS = {
  '/': 'Dashboard', '/bookings': 'Cab Bookings', '/intercity': 'Intercity Rides',
  '/rental': 'Rental Rides', '/customers': 'Customers',
  '/drivers': 'Drivers', '/employees': 'Employees', '/finance': 'Finance',
  '/incentives': 'Driver Incentives', '/packages': 'Tour Packages',
  '/coupons': 'Coupons', '/settings': 'Settings',
};

export default function Topbar({ onMenuClick, onLogout }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const label = LABELS[pathname] || LABELS[Object.keys(LABELS).find(k => pathname.startsWith(k) && k !== '/') || ''] || 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button onClick={onMenuClick} className="topbar-menu-btn">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className="topbar-breadcrumb">
          MyTaxi / <strong>{label}</strong>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user" onClick={onLogout}>
          <div className="av av-o topbar-user-avatar">{user?.name?.[0] || 'A'}</div>
          <div className="topbar-user-info">
            <div className="topbar-user-name">{user?.name || 'Admin'}</div>
            <div className="topbar-user-role">{user?.role || 'superadmin'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
