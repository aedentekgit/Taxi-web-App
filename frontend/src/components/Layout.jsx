import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function Layout({ children, sosBadge }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1100);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 1100) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }

      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 900;

  const handleToggle = () => {
    if (isMobile) setMobileOpen(o => !o);
    else setCollapsed(c => !c);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="mobile-overlay" />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${isMobile ? (mobileOpen ? 'mobile-visible' : 'mobile-hidden') : ''}`}>
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggle}
          sosBadge={sosBadge}
        />
      </div>

      {/* Main */}
      <div className="main-area">
        <Topbar onMenuClick={handleToggle} onLogout={handleLogout} />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}
