import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import { intercityAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge, getStatusBtnClass } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const STATUSES = ['', 'pending', 'accepted', 'started', 'completed', 'cancelled'];
const TRIP_TYPES = ['', 'one_way', 'round_trip'];

export default function Intercity() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', tripType: '', search: '', page: 1 });
  const [updating, setUpdating] = useState(null);
  const { showToast, ToastContainer } = useToast();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    intercityAPI.getAll(params)
      .then(r => { setBookings(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load bookings', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await intercityAPI.updateStatus(id, { status });
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
        title="Intercity" 
        description="Track and coordinate long-distance intercity rides." 
        icon="🛣️" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search by ID, city, customer..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </CustomSelect>
        <CustomSelect className="filter-select" value={filters.tripType} onChange={e => setFilter('tripType', e.target.value)}>
          {TRIP_TYPES.map(t => <option key={t} value={t}>{t || 'All Trip Types'}</option>)}
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', tripType: '', search: '', page: 1 })}>Reset</button>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S NO</th><th>Booking ID</th><th>Customer</th><th>Driver</th><th>Route</th>
                  <th>Trip Type</th><th>Date</th><th>Fare</th><th>Payment</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={11} className="text-center text-muted p-40">No bookings found</td></tr>
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
                    <td className="text-12">
                      <div className="font-semibold">{b.fromCity} → {b.toCity}</div>
                      <div className="text-muted">{b.pickup?.address}</div>
                    </td>
                    <td>
                      <span className={`badge-sm ${b.tripType === 'round_trip' ? 'badge-purple' : 'badge-blue'} capitalize font-semibold`}>
                        {b.tripType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-12">{b.travelDate ? new Date(b.travelDate).toLocaleDateString() : '—'}</td>
                    <td className="font-semibold">₹{b.fare}</td>
                    <td className="capitalize text-12">{b.paymentMethod}</td>
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
