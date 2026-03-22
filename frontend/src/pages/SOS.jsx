import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import { sosAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

export default function SOS() {
  const [alerts, setAlerts]     = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [actioning, setAction]  = useState(null);
  const { showToast, ToastContainer } = useToast();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    sosAPI.getAll(params)
      .then(r => { setAlerts(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load SOS alerts', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAcknowledge = async (id) => {
    setAction(id);
    try {
      await sosAPI.acknowledge(id);
      showToast('Alert acknowledged', 'success');
      fetch();
      if (selected?._id === id) setSelected(prev => ({ ...prev, status: 'acknowledged' }));
    } catch { showToast('Action failed', 'error'); }
    finally { setAction(null); }
  };

  const handleResolve = async (id) => {
    setAction(id);
    try {
      await sosAPI.resolve(id);
      showToast('Alert resolved', 'success');
      fetch();
      if (selected?._id === id) setSelected(null);
    } catch { showToast('Action failed', 'error'); }
    finally { setAction(null); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  const activeCount = alerts.filter(a => a.status === 'active').length;

  return (
    <div>
      <ToastContainer />

      {activeCount > 0 && (
        <div className="bg-red-100 border-red-300 rounded-10 px-20 py-12 mb-20 flex items-center gap-12">
          <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span className="text-red-600 font-bold text-14">⚠ {activeCount} active SOS alert{activeCount > 1 ? 's' : ''} require immediate attention!</span>
        </div>
      )}

      <PageHeader 
        title="S O S" 
        description="Monitor and respond to emergency SOS alerts." 
        icon="🚨" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Alerts</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', page: 1 })}>Show All</button>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>S NO</th><th>Alert ID</th><th>User</th><th>Type</th><th>Location</th><th>Booking</th><th>Status</th><th>Triggered</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {alerts.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted p-40">No SOS alerts found</td></tr>
                )}
                {alerts.map((a, _index) => (
                  <tr key={a._id} className={a.status === 'active' ? 'bg-red-50' : ''}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td>
                      <span className={`font-bold text-12 ${a.status === 'active' ? 'text-red-500' : 'text-orange'}`}>
                        {a.alertId}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-13">
                        {a.customer?.name || a.driver?.name || '—'}
                      </div>
                      <div className="text-11 text-muted capitalize">
                        {a.raisedByType}
                      </div>
                    </td>
                    <td>
                      <span className="bg-red-100 text-red-500 text-11 px-8 py-2 rounded-10 font-bold">
                        SOS
                      </span>
                    </td>
                    <td className="text-12 text-sub max-w-180">
                      {a.location?.address || (a.location?.coordinates ? `${a.location.coordinates[1].toFixed(4)}, ${a.location.coordinates[0].toFixed(4)}` : '—')}
                    </td>
                    <td className="text-12 text-orange font-semibold">
                      {a.booking?.bookingId || '—'}
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-12 text-muted">{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline text-11 px-8 py-3" onClick={() => setSelected(a)} title="View"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                        {a.status === 'active' && (
                          <button className="btn text-11 px-8 py-3 bg-amber-500 text-white border-amber-500"
                            disabled={actioning === a._id} onClick={() => handleAcknowledge(a._id)} title="Acknowledge"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></button>
                        )}
                        {(a.status === 'active' || a.status === 'acknowledged') && (
                          <button className="btn btn-primary text-11 px-8 py-3"
                            disabled={actioning === a._id} onClick={() => handleResolve(a._id)} title="Resolve"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          <div className="flex items-center gap-8">
            <h3 className="m-0">SOS Alert — {selected?.alertId}</h3>
            {selected && <StatusBadge status={selected.status} />}
          </div>
        }
        maxWidthClass="max-w-480"
        footer={
          selected && (selected.status === 'active' || selected.status === 'acknowledged') ? (
            <>
              {selected.status === 'active' && (
                <button className="btn bg-amber-500 text-white border-amber-500"
                  onClick={() => { handleAcknowledge(selected._id); setSelected(null); }} title="Acknowledge"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></button>
              )}
              {(selected.status === 'active' || selected.status === 'acknowledged') && (
                <button className="btn btn-primary" onClick={() => { handleResolve(selected._id); setSelected(null); }} title="Resolve"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></button>
              )}
            </>
          ) : null
        }
      >
        {[
          ['Raised By', `${selected?.customer?.name || selected?.driver?.name || '—'} (${selected?.raisedByType})`],
          ['Phone', selected?.customer?.phone || selected?.driver?.phone || '—'],
          ['Booking', selected?.booking?.bookingId || '—'],
          ['Location', selected?.location?.address || 'N/A'],
          selected && ['Triggered At', new Date(selected.createdAt).toLocaleString()],
          selected?.acknowledgedAt ? ['Acknowledged At', new Date(selected.acknowledgedAt).toLocaleString()] : null,
          selected?.resolvedAt ? ['Resolved At', new Date(selected.resolvedAt).toLocaleString()] : null,
        ].filter(Boolean).map(([l, v]) => (
          <div key={l} className="flex justify-between border-b pb-8 shrink-0">
            <span className="text-sub text-13">{l}</span>
            <span className="font-semibold text-13 text-right max-w-[60%]">{v}</span>
          </div>
        ))}
        {selected?.notes && (
          <div className="bg-bg p-12 rounded-8 shrink-0">
            <div className="text-12 text-muted mb-4">Notes</div>
            <div className="text-13">{selected.notes}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
