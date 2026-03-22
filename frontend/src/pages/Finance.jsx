import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect } from 'react';
import { financeAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { useToast } from '../hooks/useToast.jsx';

const PERIODS = [{ label: 'Last 7 Days', value: '7d' }, { label: 'Last 30 Days', value: '30d' }, { label: 'Last 90 Days', value: '90d' }, { label: 'Last Year', value: '1y' }];

function StatCard({ label, value, sub, color = 'var(--text)' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export default function Finance() {
  const [period, setPeriod]     = useState('30d');
  const [summary, setSummary]   = useState(null);
  const [topDrivers, setTop]    = useState([]);
  const [trend, setTrend]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      financeAPI.getSummary(period),
      financeAPI.getTopDrivers(period),
      financeAPI.getRevenueTrend(period),
    ]).then(([s, t, tr]) => {
      setSummary(s.data.data);
      setTop(t.data.data);
      setTrend(tr.data.data);
    }).catch(() => showToast('Failed to load finance data', 'error'))
      .finally(() => setLoading(false));
  }, [period]);

  const fmt = (n = 0) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  if (loading) return <PageLoader />;

  const maxTrend = Math.max(...trend.map(t => t.revenue || 0), 1);

  return (
    <div>
      <ToastContainer />
      <PageHeader 
        title="Finance" 
        description="Track earnings, payouts, and financial summaries." 
        icon="💵" 
        statLabel="Total Revenue" 
        statValue={summary?.totalRevenue ? fmt(summary.totalRevenue) : '₹0'} 
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", gap: "10px" }}>
        {PERIODS.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`${period === p.value ? 'btn btn-primary' : 'btn btn-outline'} text-12 px-14 py-6`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <StatCard label="Total Revenue"    value={fmt(summary?.totalRevenue)}    sub="Gross fare collected" />
        <StatCard label="Admin Commission" value={fmt(summary?.adminCommission)} sub="Platform earnings" color="var(--orange)" />
        <StatCard label="Driver Earnings"  value={fmt(summary?.driverEarnings)}  sub="Paid to drivers" color="#22c55e" />
        <StatCard label="Total Rides"      value={(summary?.totalRides || 0).toLocaleString()} sub="Completed rides" />
        <StatCard label="Avg Fare"         value={`₹${Math.round(summary?.avgFare || 0)}`} sub="Per ride" />
        <StatCard label="Commission Rate"  value={`${summary?.commissionRate || 0}%`} sub="Platform cut" />
      </div>

      <div className="grid grid-cols-2 gap-20 mb-24">
        {/* Revenue Trend */}
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue Trend</span></div>
          <div className="px-24 pt-16 pb-20">
            {trend.length === 0 ? (
              <div className="text-center text-muted p-40">No data</div>
            ) : (
              <div className="flex items-end gap-6 overflow-x-auto h-140">
                {trend.map((t, i) => {
                  const h = Math.max(4, Math.round((t.revenue / maxTrend) * 120));
                  return (
                    <div key={i} className="flex flex-col items-center min-w-36">
                      <div className="font-semibold text-10 text-sub mb-4">{fmt(t.revenue)}</div>
                      <div className="bg-orange w-28 opacity-85" style={{ height: h, borderRadius: '4px 4px 0 0' }} />
                      <div className="text-9 text-muted mt-4">{t._id?.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Breakdown by Type */}
        <div className="card">
          <div className="card-header"><span className="card-title">Breakdown by Ride Type</span></div>
          <div className="p-24">
            {[['Cab', summary?.byType?.cab, '#E87722'], ['Intercity', summary?.byType?.intercity, '#3b82f6'],
              ['Rental', summary?.byType?.rental, '#22c55e']].map(([l, v, c]) => {
              const total = (summary?.totalRevenue || 1);
              const pct = Math.round(((v || 0) / total) * 100);
              return (
                <div key={l} className="mb-14">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-13">{l}</span>
                    <span className="text-13">{fmt(v || 0)} ({pct}%)</span>
                  </div>
                  <div className="bg-border-light rounded-4 h-8">
                    <div className="rounded-4 h-full" style={{ width: `${pct}%`, background: c, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Drivers */}
      <div className="card">
        <div className="card-header"><span className="card-title">Top Earning Drivers</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>S NO</th><th>#</th><th>Driver</th><th>Rides</th><th>Total Earnings</th><th>Avg Per Ride</th><th>Commission Paid</th></tr>
            </thead>
            <tbody>
              {topDrivers.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted p-32">No data</td></tr>
              )}
              {topDrivers.map((d, i) => (
                <tr key={d._id}>
                    <td>{i + 1}</td>
                    <td className="font-bold text-orange">#{i + 1}</td>
                  <td>
                    <div className="font-semibold text-13">{d.name}</div>
                    <div className="text-11 text-muted">{d.phone}</div>
                  </td>
                  <td className="font-semibold">{d.totalRides}</td>
                  <td className="font-bold text-orange">{fmt(d.totalEarnings)}</td>
                  <td>{fmt(Math.round(d.totalEarnings / (d.totalRides || 1)))}</td>
                  <td className="font-semibold text-green">{fmt(d.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
