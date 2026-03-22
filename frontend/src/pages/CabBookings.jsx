import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import { bookingsAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge, getStatusBtnClass } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import { useToast } from '../hooks/useToast.jsx';

const STATUSES = ['All Status', 'pending', 'accepted', 'arrived', 'started', 'completed', 'cancelled'];
const PAYMENTS = ['All Payments', 'cash', 'wallet', 'online'];
const VEHICLES = ['All Vehicles', 'sedan', 'suv', 'auto', 'bike'];

export default function CabBookings() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', payment: '', vehicleType: '', search: '', page: 1 });
  const [updating, setUpdating] = useState(null);
  const { showToast, ToastContainer } = useToast();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    if (params.status === 'All Status') delete params.status;
    if (params.payment === 'All Payments') delete params.payment;
    if (params.vehicleType === 'All Vehicles') delete params.vehicleType;
    Object.keys(params).forEach(k => !params[k] && delete params[k]);

    bookingsAPI.getAll(params)
      .then(r => { setBookings(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load bookings', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await bookingsAPI.updateStatus(id, { status });
      showToast('Status updated successfully', 'success');
      fetch();
    } catch { showToast('Update failed', 'error'); }
    finally { setUpdating(null); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  const resetFilters = () => setFilters({ status: '', payment: '', vehicleType: '', search: '', page: 1 });

  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Cab Bookings" 
        description="Manage daily cab rides, assignments, and statuses." 
        icon="🚕" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search booking ID, customer or driver..." value={filters.search} onChange={v => setFilter('search', v)} />
        
        <div className="flex gap-12 flex-wrap">
          <CustomSelect className="filter-select" value={filters.status || 'All Status'} onChange={e => setFilter('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </CustomSelect>
          <CustomSelect className="filter-select" value={filters.vehicleType || 'All Vehicles'} onChange={e => setFilter('vehicleType', e.target.value)}>
            {VEHICLES.map(v => <option key={v} value={v} className="capitalize">{v}</option>)}
          </CustomSelect>
          <CustomSelect className="filter-select" value={filters.payment || 'All Payments'} onChange={e => setFilter('payment', e.target.value)}>
            {PAYMENTS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </CustomSelect>
          <button className="btn btn-outline" onClick={resetFilters}>Clear Filters</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S NO</th><th>Booking ID</th><th>Customer</th><th>Driver</th>
                  <th>Route</th><th>Vehicle</th><th>Date</th><th>Fare</th>
                  <th>Payment</th><th>Status</th><th>Action</th>
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
                    <td className="text-12" style={{ maxWidth: 200 }}>
                      <div className="truncate mb-2"><span className="text-green-500 mr-4">●</span>{b.pickup?.address || '—'}</div>
                      <div className="truncate text-muted"><span className="text-red-500 mr-4">●</span>{b.drop?.address || '—'}</div>
                    </td>
                    <td><span className="capitalize font-semibold text-12">{b.vehicleType || 'Any'}</span></td>
                    <td className="text-12">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="font-semibold">₹{b.fare}</td>
                    <td className="capitalize text-12">{b.paymentMethod}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <CustomSelect className={`btn ${getStatusBtnClass(b.status)} text-12 min-w-110 capitalize`}
                        value={b.status} disabled={updating === b._id}
                        onChange={e => handleStatusChange(b._id, e.target.value)}>
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
