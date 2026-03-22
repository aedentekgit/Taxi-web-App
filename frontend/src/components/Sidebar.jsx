import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NavItem = ({ to, icon, label, badge, onClick }) => (
  <NavLink to={to} end={to === '/'} onClick={onClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
    <span className="nav-icon" dangerouslySetInnerHTML={{ __html: icon }} />
    <span className="nav-label">{label}</span>
    {badge && <span className="nav-badge">{badge}</span>}
  </NavLink>
);

const icons = {
  dashboard: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  bookings:  `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v2"/><circle cx="16" cy="17" r="2"/><circle cx="7" cy="17" r="2"/></svg>`,
  intercity: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  rental:    `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  customers: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  drivers:   `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  employees: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><circle cx="12" cy="10" r="2"/><path d="M7 20v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>`,
  notifications: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  coupons:   `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  incentives:`<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  packages:  `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  tour_packages: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  destinations: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  rental_packages:`<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  services: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M12 22V12"/></svg>`,
  finance: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  support: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-3a2 2 0 0 1 2-2h1zM3 19a2 2 0 0 0 2 2h1v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  sos: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  settings:  `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  roles:     `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  pricing:   `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>`,
};

const GroupLabel = ({ label }) => (
  <div className="group-label">{label}</div>
);

export default function Sidebar({ collapsed, onToggle, sosBadge = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const close = () => {
    if (window.innerWidth <= 900) onToggle();
  };

  const hasPerm = (p) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return user.permissions?.includes(p);
  };

  const hasAnyMain = hasPerm('dashboard');
  const hasAnyBooking = ['bookings', 'intercity', 'rental'].some(hasPerm);
  const hasAnyPeople = ['customers', 'drivers', 'employees'].some(hasPerm);
  const hasAnyOps = ['finance', 'support', 'sos'].some(hasPerm);
  const hasAnyGrowth = ['pricing', 'incentives', 'coupons', 'packages'].some(hasPerm);
  const hasAnySystem = ['roles', 'settings'].some(hasPerm);

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Logo */}
      <div className="sidebar-logo-wrap">
        <div className="sidebar-logo">M</div>
        {!collapsed && <span className="sidebar-title">MyTaxi</span>}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav-wrap">
        
        {hasAnyMain && <>
          {!collapsed && <GroupLabel label="MAIN" />}
          {hasPerm('dashboard') && <NavItem to="/" icon={icons.dashboard} label="Dashboard" onClick={close} />}
        </>}

        {hasAnyBooking && <>
          {!collapsed && <GroupLabel label="BOOKINGS" />}
          {hasPerm('bookings') && <NavItem to="/bookings"  icon={icons.bookings}  label="Cab Bookings"      onClick={close} />}
          {hasPerm('intercity') && <NavItem to="/intercity" icon={icons.intercity} label="Intercity"         onClick={close} />}
          {hasPerm('rental') && <NavItem to="/rental"    icon={icons.rental}    label="Rental Rides"      onClick={close} />}
        </>}

        {hasAnyPeople && <>
          {!collapsed && <GroupLabel label="PEOPLE" />}
          {hasPerm('customers') && <NavItem to="/customers" icon={icons.customers} label="Customers"         onClick={close} />}
          {hasPerm('drivers') && <NavItem to="/drivers"   icon={icons.drivers}   label="Drivers"           onClick={close} />}
          {hasPerm('employees') && <NavItem to="/employees" icon={icons.employees} label="Employees"         onClick={close} />}
        </>}

        {hasAnyOps && <>
          {!collapsed && <GroupLabel label="OPERATIONS" />}
          {hasPerm('finance') && <NavItem to="/finance"   icon={icons.finance}   label="Finance"           onClick={close} />}
          {hasPerm('support') && <NavItem to="/support"   icon={icons.support}   label="Support"           onClick={close} />}
          {hasPerm('sos') && <NavItem to="/sos"       icon={icons.sos}       label="SOS Alerts"        badge={sosBadge || null} onClick={close} />}
        </>}

        {hasAnyGrowth && <>
          {!collapsed && <GroupLabel label="GROWTH" />}
          {hasPerm('pricing') && <NavItem to="/pricing"   icon={icons.pricing}   label="Pricing Setup"      onClick={close} />}
          {hasPerm('packages') && <NavItem to="/packages" icon={icons.tour_packages} label="Tour Packages" onClick={close} />}
          {hasPerm('packages') && <NavItem to="/destinations" icon={icons.destinations} label="Destinations" onClick={close} />}
          {hasPerm('packages') && <NavItem to="/services" icon={icons.services} label="Our Services" onClick={close} />}
          {hasPerm('rental') && <NavItem to="/rental-packages" icon={icons.rental_packages} label="Rental Packages" onClick={close} />}
          {hasPerm('incentives') && <NavItem to="/incentives" icon={icons.incentives} label="Driver Incentives" onClick={close} />}
          {hasPerm('coupons') && <NavItem to="/coupons"   icon={icons.coupons}   label="Coupons"            onClick={close} />}
        </>}

        {hasAnySystem && <>
          {!collapsed && <GroupLabel label="SYSTEM" />}
          {hasPerm('roles') && <NavItem to="/roles"     icon={icons.roles}     label="Roles"              onClick={close} />}
          {hasPerm('settings') && <NavItem to="/settings"  icon={icons.settings}  label="Settings"           onClick={close} />}
        </>}

      </nav>
    </aside>
  );
}
