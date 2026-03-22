import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { driversAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

const TABS = ['all', 'pending', 'approved', 'rejected', 'blocked'];

export default function Drivers() {
  const [drivers, setDrivers]   = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [filters, setFilters]   = useState({ search: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [actioning, setAction]  = useState(null);
  
  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters, status: tab === 'all' ? '' : tab };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    driversAPI.getAll(params)
      .then(r => { setDrivers(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load drivers', 'error'))
      .finally(() => setLoading(false));
  }, [filters, tab]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleEditSave = async () => {
    if (editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) return showToast('Please enter a valid email address', 'error');
    }
    if (!editForm.name || !editForm.phone) return showToast('Name and phone are required', 'error');
    if (!editForm.vehicleNumber) return showToast('Vehicle number is required', 'error');
    if (editForm.phone && editForm.phone.length < 10) return showToast('Please enter a valid phone number', 'error');
    setSaving(true);
    try {
      if (selected === 'add') {
        await driversAPI.create({ ...editForm, status: 'approved' });
        showToast('Driver created successfully', 'success');
      } else {
        await driversAPI.update(selected._id, editForm);
        showToast('Driver updated successfully', 'success');
        setSelected({ ...selected, ...editForm });
      }
      setSelected(null);
      setIsEditing(false);
      fetch();
    } catch (e) {
      showToast(e.response?.data?.message || (selected === 'add' ? 'Creation failed' : 'Update failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this driver?'))) return;
    try {
      await driversAPI.remove(id);
      showToast('Driver deleted', 'success');
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Delete failed', 'error'); }
  };

  const doAction = async (fn, id, label) => {
    setAction(id);
    try {
      await fn(id);
      const isErrorAction = label === 'rejected' || label === 'blocked';
      showToast(`Driver ${label}`, isErrorAction ? 'error' : 'success');
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Action failed', 'error'); }
    finally { setAction(null); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  return (
    <div className="fade-in">
      <ToastContainer />

      {/* Premium Header */}
      <PageHeader 
        title="Driver Marketplace" 
        description="Monitor performance, verify documents, and manage your global driver fleet." 
        icon="👨‍✈️" 
        statLabel="Total Fleet" 
        statValue={meta.total} statIcon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="22" height="22"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>} 
      />
      <div className="filter-bar">
        <SearchInput 
          placeholder="Search by name, phone, plate..." 
          value={filters.search} 
          onChange={v => setFilter('search', v)} 
        />
        <button className="btn btn-outline" onClick={() => setFilters({ search: '', page: 1 })}>
          Clear Filters
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => { setSelected('add'); setIsEditing(true); setEditForm({ name: '', phone: '', email: '', vehicleType: 'sedan', vehicleModel: '', vehicleNumber: '' }); }}>+ Add Driver</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S NO</th>
                  <th>Profile</th>
                  <th>Driver Details</th>
                  <th>Vehicle Details</th>
                  <th>Core Metrics</th>
                  <th>Account Status</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted p-40">No drivers found matching these criteria.</td></tr>
                )}
                {drivers.map((d, _index) => (
                  <tr key={d._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td>
                      <div className="flex justify-center">
                        <div className="av av-o av-md">{d.name?.[0]?.toUpperCase() || '?'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-13">{d.name}</div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className={`status-dot ${d.isOnline ? 'dot-green' : 'dot-red'}`} />
                        <span className="text-10 font-bold uppercase tracking-widest text-muted">{d.isOnline ? 'Active Now' : 'Offline'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-12 uppercase tracking-widest">{d.vehicleNumber || 'N/A'}</div>
                      <div className="text-11 text-sub capitalize">{d.vehicleModel || d.vehicleType || 'Any'}</div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-13">{d.totalRides || 0} Rides</span>
                        <span className="text-12 text-sub">{d.avgRating > 0 ? `★${Number(d.avgRating).toFixed(1)} Rating` : 'New Rating'}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={d.status === 'approved' ? 'approved' : 'blocked'} /></td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => setSelected(d)} title="View"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                        
                        <button className={`btn ${d.status === 'approved' ? 'btn-danger' : 'btn-success'} btn-icon`} disabled={actioning === d._id}
                          onClick={() => doAction(driversAPI.toggleBlock, d._id, d.status === 'approved' ? 'blocked' : 'approved')} title={d.status === 'approved' ? 'Block' : 'Approve'}>
                          {d.status === 'approved' ? ( <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> ) : ( <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> )}
                        </button>

                        <button className="btn btn-danger btn-icon" disabled={actioning === d._id} onClick={() => handleDelete(d._id)} title="Delete"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
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

      {/* Driver Modal remains highly functional, just ensuring it uses premium styles */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setIsEditing(false); }}
        title={selected === 'add' ? 'Add Driver' : isEditing ? 'Edit Driver' : 'Driver Profile'}
        maxWidthClass="max-w-640"
        footer={isEditing ? (
          <>
            <button className="btn btn-outline" onClick={() => { if (selected === 'add') setSelected(null); else setIsEditing(false); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>
              {saving ? 'Saving...' : selected === 'add' ? 'Create Driver' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => { setEditForm({ ...selected }); setIsEditing(true); }}>Edit Profile</button>
        )}
      >
        <div style={{ padding: '4px' }}>
          {isEditing ? (
            <div>
               <div className="grid-2 mb-20">
                 <div className="form-group col-span-full">
                   <label>Full Name *</label>
                   <input className="form-input" placeholder="e.g. John Doe" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                 </div>
                 <div className="form-group">
                   <label>Phone Number *</label>
                   <input className="form-input" placeholder="10-digit mobile" value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                 </div>
                 <div className="form-group">
                   <label>Email Address</label>
                   <input type="email" className="form-input" placeholder="john@example.com" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                 </div>
               </div>

               <h4 className="font-semibold text-12 text-sub uppercase tracking-widest mb-16 border-b pb-8">Vehicle Details</h4>
               <div className="grid-3">
                 <div className="form-group">
                   <label>Type</label>
                   <CustomSelect className="form-input capitalize" value={editForm.vehicleType || ''} onChange={e => setEditForm(f => ({ ...f, vehicleType: e.target.value }))}>
                     {['sedan','suv','auto','bike'].map(v => <option key={v} value={v}>{v}</option>)}
                   </CustomSelect>
                 </div>
                 <div className="form-group">
                   <label>Model</label>
                   <input className="form-input" placeholder="e.g. Swift Dzire" value={editForm.vehicleModel || ''} onChange={e => setEditForm(f => ({ ...f, vehicleModel: e.target.value }))} />
                 </div>
                 <div className="form-group">
                   <label>Vehicle No. *</label>
                   <input className="form-input uppercase" placeholder="TN 01 AB 1234" value={editForm.vehicleNumber || ''} onChange={e => setEditForm(f => ({ ...f, vehicleNumber: e.target.value }))} />
                 </div>
               </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-20 mb-24">
                <div className="av av-o" style={{ width: '64px', height: '64px', fontSize: '28px' }}>
                  {selected?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-12 mb-4">
                    <h2 className="text-24 font-bold text-text m-0">{selected?.name}</h2>
                    <StatusBadge status={selected?.status === 'approved' ? 'approved' : 'blocked'} />
                  </div>
                  <div className="flex gap-16 text-sub text-13 mt-8">
                    <span className="flex items-center gap-6">📱 {selected?.phone}</span>
                    <span className="flex items-center gap-6">✉️ {selected?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="grid-4 mb-24">
                 {[
                   { label: 'Total Rides', val: selected?.totalRides || 0 },
                   { label: 'Rating', val: selected?.avgRating ? `${Number(selected.avgRating).toFixed(1)} ⭐` : 'New' },
                   { label: 'Balance', val: `₹${selected?.walletBalance || 0}` },
                   { label: 'Verified', val: selected?.status === 'approved' ? 'Yes' : 'No' }
                 ].map(s => (
                   <div key={s.label} className="kpi-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div className="kpi-label">{s.label}</div>
                      <div className="kpi-value text-18 mt-8">{s.val}</div>
                   </div>
                 ))}
              </div>

              <h4 className="font-semibold text-12 text-sub uppercase tracking-widest mb-16 border-b pb-8">Vehicle Information</h4>
              <div className="kpi-card bg-slate-50" style={{ padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="grid-3">
                  <div>
                    <div className="text-11 text-sub mb-4">Type</div>
                    <div className="font-bold text-14 capitalize text-text">{selected?.vehicleType || 'Any'}</div>
                  </div>
                  <div>
                    <div className="text-11 text-sub mb-4">Model</div>
                    <div className="font-bold text-14 text-text">{selected?.vehicleModel || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-11 text-sub mb-4">Registration No.</div>
                    <div className="font-bold text-14 uppercase text-text">{selected?.vehicleNumber || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
