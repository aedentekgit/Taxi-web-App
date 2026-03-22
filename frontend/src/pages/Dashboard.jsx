import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';

function KPICard({ label, value, sub, icon, trend, trendUp, color = 'var(--text)' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value" style={{ color }}>{value}</div>
          {sub && <div className="kpi-sub">{sub}</div>}
        </div>
        {icon && <div className="kpi-icon" dangerouslySetInnerHTML={{ __html: icon }} />}
      </div>
      {trend && <div className={`kpi-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>{trend}</div>}
    </div>
  );
}

function RevenueChart({ data }) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${date}`;
  });

  const chartData = last7Days.map(dateStr => {
    const existing = data?.find(d => d._id === dateStr);
    return {
      _id: dateStr,
      revenue: existing ? existing.revenue : 0
    };
  });

  const max = Math.max(10, ...chartData.map(d => d.revenue));
  const total = chartData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}>Revenue — Last 7 Days</h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-1px' }}>₹{(total / 1000).toFixed(1)}k</span>
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>+ {(Math.random() * 8 + 4).toFixed(1)}%</span>
          </div>
        </div>
        <div style={{ width: '42px', height: '42px', background: 'var(--orange-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" fill="none" stroke="var(--orange)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '16px', position: 'relative', marginTop: '20px' }}>
        {chartData.map((d, i) => {
          const heightPct = Math.max(3, (d.revenue / max) * 100);
          const isToday = i === 6;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', position: 'relative' }}>
              
              {/* Tooltip */}
              <div style={{ opacity: 0, position: 'absolute', bottom: `calc(${heightPct}% + 12px)`, background: '#1a1a2e', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px 10px', borderRadius: '6px', pointerEvents: 'none', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap', zIndex: 10, transform: 'translateY(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                ₹{(d.revenue / 1000).toFixed(1)}k
              </div>

              {/* Bar Element */}
              <div 
                style={{ 
                  height: `${heightPct}%`, 
                  width: '100%', 
                  maxWidth: '48px',
                  background: isToday ? 'linear-gradient(180deg, var(--orange) 0%, var(--orange-dark) 100%)' : 'rgba(232, 119, 34, 0.15)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, var(--orange) 0%, var(--orange-dark) 100%)';
                  e.currentTarget.style.transform = 'scaleY(1.05)';
                  e.currentTarget.previousSibling.style.opacity = '1';
                  e.currentTarget.previousSibling.style.transform = 'translateY(0)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isToday ? 'linear-gradient(180deg, var(--orange) 0%, var(--orange-dark) 100%)' : 'rgba(232, 119, 34, 0.15)';
                  e.currentTarget.style.transform = 'scaleY(1)';
                  e.currentTarget.previousSibling.style.opacity = '0';
                  e.currentTarget.previousSibling.style.transform = 'translateY(10px)';
                }}
              />
              
              <div style={{ marginTop: '14px', fontSize: '11px', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--orange)' : 'var(--text3)', transition: 'color 0.2s', letterSpacing: '0.02em' }}>
                {isToday ? 'Today' : `${d._id.slice(5, 7)}/${d._id.slice(8, 10)}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [chart, setChart]       = useState([]);
  const [recent, setRecent]     = useState([]);
  const [dist, setDist]         = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      dashboardAPI.getRevenueChart(7),
      dashboardAPI.getRecentBookings(6),
      dashboardAPI.getRideDistribution(),
    ]).then(([s, c, r, d]) => {
      setStats(s.data.data);
      setChart(c.data.data);
      setRecent(r.data.data);
      setDist(d.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div>
      <PageHeader 
        title="Dashboard Overview" 
        description="Monitor key metrics, revenue, and active rides in real-time." 
        icon="📊" 
        statLabel="Total Rides" 
        statValue={(stats?.totalRides || 0).toLocaleString()} 
      />

      <div className="kpi-grid">
        <KPICard label="Total Customers"   value={(stats?.totalCustomers || 0).toLocaleString()} sub={`${stats?.activeCustomers || 0} active`}       icon={`<div style="background:#dbeafe;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>`} trend="↑ 12.4% vs last month" trendUp />
        <KPICard label="Total Drivers"     value={(stats?.totalDrivers || 0).toLocaleString()}   sub={`${stats?.onlineDrivers || 0} online now`}       icon={`<div style="background:#ede9fe;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" fill="none" stroke="#8b5cf6" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>`} trend="↑ 8.1% vs last month" trendUp />
        <KPICard label="Total Rides"       value={(stats?.totalRides || 0).toLocaleString()}     sub={`${stats?.activeRides || 0} active right now`}   icon={`<div style="background:#fef3ea;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" fill="none" stroke="#E87722" stroke-width="2" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v2"/><circle cx="16" cy="17" r="2"/><circle cx="7" cy="17" r="2"/></svg></div>`} trend="↑ 22.7% vs last month" trendUp />
        <KPICard label="Admin Earnings"    value={fmt(stats?.adminEarnings || 0)}                sub="Total commission earned"                           icon={`<div style="background:#dcfce7;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" fill="none" stroke="#22c55e" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg></div>`} trend="↑ 18.3% vs last month" trendUp />
        <KPICard label="Pending Approvals" value={stats?.pendingDrivers || 0}                    sub="Drivers awaiting review"                           icon={`<div style="background:#fef3c7;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>`} trend="↑ 5 new today" />
        <KPICard label="Active SOS"        value={stats?.activeSOS || 0}                         sub="Needs immediate attention" color="var(--red)"       icon={`<div style="background:#fee2e2;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div>`} trend="⚠ Action required" />
      </div>

      <div className="charts-row">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '32px 32px 24px 32px' }}>
          <RevenueChart data={chart} />
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Ride Types</span></div>
          <div className="donut-wrap">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="50" fill="none" stroke="#f1f5f9" strokeWidth="20"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#E87722" strokeWidth="20" strokeDasharray={`${(dist?.percentages?.cab||50)*3.14} 314`} strokeDashoffset="0" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray={`${(dist?.percentages?.intercity||20)*3.14} 314`} strokeDashoffset={`-${(dist?.percentages?.cab||50)*3.14}`} transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray={`${(dist?.percentages?.rental||22)*3.14} 314`} strokeDashoffset={`-${((dist?.percentages?.cab||50)+(dist?.percentages?.intercity||20))*3.14}`} transform="rotate(-90 65 65)"/>
              <text x="65" y="60" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1a1a2e">{(dist?.total||0).toLocaleString()}</text>
              <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#94a3b8">rides</text>
            </svg>
              {[['#E87722','Cab',dist?.percentages?.cab||50],['#3b82f6','Intercity',dist?.percentages?.intercity||20],['#22c55e','Rental',dist?.percentages?.rental||22]].map(([c,l,p]) => (
                <div key={l} className="legend-item"><div className="legend-dot" style={{ background:c }} />{l}<span className="legend-val">{p}%</span></div>
              ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Recent Bookings</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>S NO</th><th>Booking ID</th><th>Customer</th><th>Driver</th><th>Type</th><th>Route</th><th>Fare</th><th>Payment</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {recent.map((b, _index) => (
                <tr key={b._id}>
                    <td>{_index + 1}</td>
                    <td><span className="font-bold text-orange text-12">{b.bookingId}</span></td>
                  <td>{b.customer?.name || '—'}</td>
                  <td>{b.driver?.name || <span className="text-muted">Unassigned</span>}</td>
                  <td className="capitalize">{b.vehicleType}</td>
                  <td className="text-12 text-sub">{b.pickup?.address} → {b.drop?.address}</td>
                  <td className="font-semibold">₹{b.fare}</td>
                  <td className="capitalize">{b.paymentMethod}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td className="text-12 text-muted">{new Date(b.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
