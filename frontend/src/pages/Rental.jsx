import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import { rentalAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge, getStatusBtnClass } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const STATUSES = ['', 'pending', 'accepted', 'started', 'completed', 'cancelled'];

export default function Rental() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', search: '', page: 1 });
  const [updating, setUpdating] = useState(null);
  const { showToast, ToastContainer } = useToast();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    rentalAPI.getAll(params)
      .then(r => { setBookings(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load rentals', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await rentalAPI.updateStatus(id, { status });
      showToast('Status updated', 'success');
      fetch();
    } catch { showToast('Update failed', 'error'); }
    finally { setUpdating(null); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Rental" 
        description="Manage active rental bookings." 
        icon="🚗" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search booking ID, customer..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', search: '', page: 1 })}>Reset</button>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S NO</th><th>Booking ID</th><th>Customer</th><th>Driver</th><th>Package</th>
                  <th>Hours / KMs</th><th>Base Fare</th><th>Extra Charges</th><th>Total</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={11} className="text-center text-muted p-40">No rentals found</td></tr>
                )}
                {bookings.map((b, _index) => (
                  <tr key={b._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td><span className="font-bold text-orange text-12">{b.bookingId}</span></td>
                    <td>
                      <div className="font-semibold text-13">{b.customer?.name || '—'}</div>
                      <div className="text-11 text-muted">{b.customer?.phone}</div>
                    </td>
                    <td>{b.driver?.name || <span className="text-muted text-12">Unassigned</span>}</td>
                    <td>
                      <div className="font-semibold text-13">{b.packageName}</div>
                      <div className="text-11 text-muted">{b.vehicleType}</div>
                    </td>
                    <td className="text-12">
                      <div>{b.includedHours}h / {b.includedKms}km</div>
                      {(b.extraHours > 0 || b.extraKms > 0) && (
                        <div className="text-orange">+{b.extraHours || 0}h +{b.extraKms || 0}km</div>
                      )}
                    </td>
                    <td className="font-semibold">₹{b.baseFare}</td>
                    <td className={`font-semibold ${b.extraCharges > 0 ? 'text-orange' : 'text-muted'}`}>
                      {b.extraCharges > 0 ? `₹${b.extraCharges}` : '—'}
                    </td>
                    <td className="font-bold">₹{b.fare}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <CustomSelect className={`btn ${getStatusBtnClass(b.status)} text-12 min-w-110 capitalize`}
                        value={b.status} disabled={updating === b._id}
                        onChange={e => handleStatus(b._id, e.target.value)}>
                        {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                      </CustomSelect>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </div>
  );
}
