import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import { couponsAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const BLANK = { code: '', discountType: 'percentage', discountValue: '', maxDiscount: '', minOrderValue: '', maxUses: '', serviceType: 'all', expiresAt: '', perUserLimit: '', firstRideOnly: false, userType: 'all', validFrom: '', timeWindowStart: '', timeWindowEnd: '', city: '', paymentMethod: '' };
const SERVICE_TYPES = ['all', 'cab', 'intercity', 'rental'];

export default function Coupons() {
  const [coupons, setCoupons]   = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', search: '', page: 1 });
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [validate, setValidate] = useState({ code: '', amount: '', result: null });
  const [validating, setVld]    = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    couponsAPI.getAll(params)
      .then(r => { setCoupons(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load coupons', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd  = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      maxDiscount: c.maxDiscount || '', minOrderValue: c.minOrderValue || '',
      maxUses: c.maxUses || '', serviceType: c.serviceType || 'all',
      expiresAt: c.validUntil ? String(c.validUntil).slice(0, 10) : (c.expiresAt ? String(c.expiresAt).slice(0, 10) : ''),
      perUserLimit: c.perUserLimit || '',
      firstRideOnly: c.firstRideOnly || false,
      userType: c.userType || 'all',
      validFrom: c.validFrom ? String(c.validFrom).slice(0, 10) : '',
      timeWindowStart: c.timeWindow?.start || '',
      timeWindowEnd: c.timeWindow?.end || '',
      city: c.city || '',
      paymentMethod: c.paymentMethod || ''
    });
    setModal({ type: 'edit', id: c._id });
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) return showToast('Code and discount value required', 'error');
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.timeWindowStart || payload.timeWindowEnd) {
        payload.timeWindow = { start: payload.timeWindowStart, end: payload.timeWindowEnd };
      }
      payload.validUntil = payload.expiresAt;
      if (modal === 'add') await couponsAPI.create(payload);
      else await couponsAPI.update(modal.id, payload);
      showToast(`Coupon ${modal === 'add' ? 'created' : 'updated'}`, 'success');
      setModal(null);
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this coupon?'))) return;
    try {
      await couponsAPI.remove(id);
      showToast('Coupon deleted', 'success');
      fetch();
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleToggle = async (id, currentIsActive) => {
    try {
      await couponsAPI.toggleStatus(id);
      showToast(currentIsActive ? 'Coupon Disabled' : 'Coupon Enabled', currentIsActive ? 'error' : 'success');
      fetch();
    } catch { showToast('Update failed', 'error'); }
  };

  const handleValidate = async () => {
    if (!validate.code || !validate.amount) return showToast('Enter code and amount', 'error');
    setVld(true);
    try {
      const r = await couponsAPI.validate({ code: validate.code, orderAmount: Number(validate.amount) });
      setValidate(v => ({ ...v, result: r.data.data }));
    } catch (e) {
      setValidate(v => ({ ...v, result: { error: e.response?.data?.message || 'Invalid coupon' } }));
    } finally { setVld(false); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Coupons" 
        description="Manage discount codes and promotional campaigns." 
        icon="🏷️" 
        statLabel="Total Coupons" 
        statValue={meta?.total || 0} statIcon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="22" height="22"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>} 
      />

      {/* Validate Tool */}
      <div className="card mb-20">
        <div className="card-header"><span className="card-title">Test Coupon Code</span></div>
        <div className="px-24 pt-16 pb-20 flex gap-12 items-end flex-wrap">
          <div className="form-group flex-1 min-w-160 m-0">
            <label>Coupon Code</label>
            <input className="form-input" placeholder="e.g. SAVE20" value={validate.code}
              onChange={e => setValidate(v => ({ ...v, code: e.target.value.toUpperCase(), result: null }))} />
          </div>
          <div className="form-group flex-1 min-w-140 m-0">
            <label>Order Amount (₹)</label>
            <input type="number" className="form-input" placeholder="e.g. 500" value={validate.amount}
              onChange={e => setValidate(v => ({ ...v, amount: e.target.value, result: null }))} />
          </div>
          <button className="btn btn-outline" onClick={handleValidate} disabled={validating}>{validating ? 'Testing...' : 'Test'}</button>
          {validate.result && (
            <div className={`w-full px-14 py-10 rounded-8 font-semibold text-13 ${validate.result.error ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {validate.result.error ? `✗ ${validate.result.error}` : `✓ Valid! Discount: ₹${validate.result.discountAmount} | Final: ₹${validate.result.finalAmount}`}
            </div>
          )}
        </div>
      </div>
      <div className="filter-bar">
        <SearchInput placeholder="Search coupon code..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', search: '', page: 1 })}>Reset</button>
      
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={openAdd}>+ Create Coupon</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>S NO</th><th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Max Discount</th><th>Service</th><th>Used / Max</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {coupons.length === 0 && (
                  <tr><td colSpan={11} className="text-center text-muted p-40">No coupons found</td></tr>
                )}
                {coupons.map((c, _index) => (
                  <tr key={c._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td>
                      <span className="font-monospace font-bold bg-border-light px-8 py-2 rounded-6 text-13">
                        {c.code}
                      </span>
                    </td>
                    <td className="capitalize text-12">{c.discountType}</td>
                    <td className="font-bold text-orange">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="text-12">{c.minOrderValue ? `₹${c.minOrderValue}` : '—'}</td>
                    <td className="text-12">{c.maxDiscount ? `₹${c.maxDiscount}` : '—'}</td>
                    <td>
                      <span className="text-11 bg-border-light px-8 py-2 rounded-10 capitalize">{c.serviceType}</span>
                    </td>
                    <td className="text-12">
                      <span className="font-semibold">{c.usedCount || 0}</span>
                      <span className="text-muted"> / {c.maxUses || '∞'}</span>
                    </td>
                    <td className={`text-12 ${c.isExpired ? 'text-red-500' : 'text-sub'}`}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td><StatusBadge status={c.isActive && !c.isExpired ? 'active' : 'inactive'} /></td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline text-11 px-8 py-3" onClick={() => openEdit(c)} title="Edit"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className={`btn ${c.isActive ? 'btn-danger' : 'btn-primary'} text-11 px-8 py-3`}
                          onClick={() => handleToggle(c._id, c.isActive)}>
                          {c.isActive ? ( <span title="Disable"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span> ) : ( <span title="Enable"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></span> )}
                        </button>
                        <button className="btn btn-danger text-11 px-8 py-3" onClick={() => handleDelete(c._id)} title="Delete"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
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

      {/* Coupon Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Create Coupon' : 'Edit Coupon'}
        maxWidthClass="max-w-480"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Coupon'}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-14 shrink-0">
          <div className="form-group col-span-full">
            <label>Coupon Code *</label>
            <input className="form-input font-monospace font-bold tracking-widest" placeholder="e.g. SAVE20" value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </div>
          <div className="form-group">
            <label>Discount Type</label>
            <CustomSelect className="form-input" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </CustomSelect>
          </div>
          <div className="form-group">
            <label>Discount Value *</label>
            <input type="number" className="form-input" value={form.discountValue}
              onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Min Order (₹)</label>
            <input type="number" className="form-input" value={form.minOrderValue}
              onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Max Discount (₹)</label>
            <input type="number" className="form-input" value={form.maxDiscount}
              onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Max Total Uses</label>
            <input type="number" className="form-input" placeholder="Leave blank for unlimited" value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Service Type</label>
            <CustomSelect className="form-input capitalize" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </CustomSelect>
          </div>
          <div className="form-group col-span-full">
            <h4 className="text-12 font-bold text-sub uppercase tracking-wider mb-8 mt-4 border-b pb-4">Advanced Rules (Optional)</h4>
          </div>
          <div className="form-group">
            <label>Usage per User</label>
            <input type="number" className="form-input" placeholder="e.g. 1" value={form.perUserLimit}
              onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))} />
          </div>
          <div className="form-group pt-24">
            <label className="flex items-center gap-8 cursor-pointer">
              <input type="checkbox" checked={form.firstRideOnly} onChange={e => setForm(f => ({ ...f, firstRideOnly: e.target.checked }))} />
              <span className="text-13 font-semibold">First Ride Only?</span>
            </label>
          </div>
          <div className="form-group">
            <label>User Type</label>
            <CustomSelect className="form-input capitalize" value={form.userType} onChange={e => setForm(f => ({ ...f, userType: e.target.value }))}>
              <option value="all">All</option>
              <option value="new">New Users (0 rides)</option>
              <option value="existing">Existing Users (1+ rides)</option>
            </CustomSelect>
          </div>
          <div className="form-group">
            <label>Active From</label>
            <input type="date" className="form-input" value={form.validFrom}
              onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Time Window Start</label>
            <input type="time" className="form-input" value={form.timeWindowStart}
              onChange={e => setForm(f => ({ ...f, timeWindowStart: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Time Window End</label>
            <input type="time" className="form-input" value={form.timeWindowEnd}
              onChange={e => setForm(f => ({ ...f, timeWindowEnd: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>City Restriction</label>
            <input className="form-input" placeholder="e.g. Mumbai" value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <CustomSelect className="form-input capitalize" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
              <option value="">Any</option>
              <option value="online">Online</option>
              <option value="cash">Cash</option>
            </CustomSelect>
          </div>
          <div className="form-group col-span-full">
            <label>Expiry Date</label>
            <input type="date" className="form-input" value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
