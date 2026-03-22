import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import { customersAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta]           = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status: '', search: '', page: 1 });
  const [selected, setSelected]   = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    customersAPI.getAll(params)
      .then(r => { setCustomers(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load customers', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggleStatus = async (id, current) => {
    try {
      await customersAPI.toggleStatus(id, current === 'active' ? 'blocked' : 'active');
      showToast(current === 'active' ? 'Account Disabled' : 'Account Enabled', current === 'active' ? 'error' : 'success');
      fetch();
    } catch { showToast('Update failed', 'error'); }
  };



  const handleEditSave = async () => {
    if (!editForm.name || !editForm.phone) return showToast('Name and phone are required', 'error');
    if (editForm.phone.length < 10) return showToast('Enter valid phone number', 'error');
    
    setSaving(true);
    try {
      if (selected === 'add') {
        // Create new customer
        await customersAPI.create({ ...editForm, status: 'active', password: 'password123' });
        showToast('Customer created successfully', 'success');
      } else {
        await customersAPI.update(selected._id, editForm);
        showToast('Customer updated successfully', 'success');
        setSelected({ ...selected, ...editForm });
      }
      setSelected(null);
      setIsEditing(false);
      fetch();
    } catch (e) {
      showToast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this customer?'))) return;
    try {
      await customersAPI.remove(id);
      showToast('Customer deleted successfully', 'success');
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Delete failed', 'error'); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Customers" 
        description="View customer profiles and booking histories." 
        icon="👥" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search name, phone, email..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', search: '', page: 1 })}>Reset</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => { setSelected('add'); setIsEditing(true); setEditForm({ name: '', phone: '', email: '' }); }}>+ Add Customer</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>S NO</th><th>Profile</th><th>Customer</th><th>Phone</th><th>Email</th><th>Rides</th><th>Wallet</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted p-40">No customers found</td></tr>
                )}
                {customers.map((c, _index) => (
                  <tr key={c._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td>
                      <div className="flex justify-center">
                        <div className="av av-o av-md">{c.name?.[0] || '?'}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-semibold text-13">{c.name}</div>
                        {c.referralCode && <div className="text-11 text-muted">Ref: {c.referralCode}</div>}
                      </div>
                    </td>
                    <td className="text-13">{c.phone}</td>
                    <td className="text-12 text-sub">{c.email || '—'}</td>
                    <td className="font-semibold">{c.totalRides || 0}</td>
                    <td>
                      <div className="font-semibold text-orange">₹{c.walletBalance || 0}</div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-12 text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => setSelected(c)} title="View"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                        <button className={`btn ${c.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-icon`} onClick={() => handleToggleStatus(c._id, c.status)}>
                          {c.status === 'active' ? ( <span title="Block"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span> ) : ( <span title="Unblock"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></span> )}
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(c._id)} title="Delete"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
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

      {/* View / Edit Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setIsEditing(false); }}
        title={selected === 'add' ? 'Add Customer' : isEditing ? 'Edit Customer' : 'Customer Details'}
        maxWidthClass="max-w-480"
        footer={isEditing ? (
          <>
            <button className="btn btn-outline" onClick={() => { if (selected === 'add') setSelected(null); else setIsEditing(false); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => { setEditForm({...selected}); setIsEditing(true); }}>Edit Details</button>
        )}
      >
        {isEditing ? (
          <div className="flex flex-col gap-12">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-input" placeholder="Name" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" className="form-input" placeholder="Phone" value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" placeholder="Email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-14 mb-8 shrink-0">
              <div className="av av-o av-lg">{selected?.name?.[0]}</div>
              <div>
                <div className="font-bold text-18">{selected?.name}</div>
                <StatusBadge status={selected?.status} />
              </div>
            </div>
            {selected && [['Phone', selected.phone], ['Email', selected.email || '—'], ['Wallet', `₹${selected.walletBalance || 0}`],
              ['Total Rides', selected.totalRides || 0], ['Referral Code', selected.referralCode || '—'],
              ['Joined', new Date(selected.createdAt).toLocaleString()]].map(([l, v]) => (
              <div key={l} className="flex justify-between border-b pb-8 shrink-0">
                <span className="text-sub text-13">{l}</span>
                <span className="font-semibold text-13">{v}</span>
              </div>
            ))}
          </>
        )}
      </Modal>

    </div>
  );
}
