import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import { incentivesAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const BLANK = {
  title: '', description: '', incentiveType: 'ride_count',
  targetValue: '', rewardAmount: '', rewardType: 'fixed',
  startDate: '', endDate: '', timeWindowStart: '', timeWindowEnd: '',
  city: '', vehicleType: ''
};

const HeaderIcon = () => (
  <div className="sidebar-logo shadow-orange" style={{ width: 48, height: 48, fontSize: 20 }}>🏆</div>
);

export default function DriverIncentives() {
  const [incentives, setIncentives] = useState([]);
  const [meta, setMeta]           = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(BLANK);
  const [saving, setSaving]         = useState(false);
  const { showToast, ToastContainer } = useToast();

  const fetch = useCallback(() => {
    setLoading(true);
    incentivesAPI.getAll({ page: meta.page, limit: 10 })
      .then(r => {
        setIncentives(r.data.data);
        if (r.data.page) {
          setMeta(m => ({ ...m, total: r.data.total, pages: r.data.pages }));
        }
      })
      .catch(() => showToast('Failed to load incentives', 'error'))
      .finally(() => setLoading(false));
  }, [meta.page]);

  const setPage = (p) => setMeta(m => ({ ...m, page: p }));

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd  = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (i) => {
    setForm({
       ...i,
       startDate: i.startDate ? String(i.startDate).slice(0, 10) : '',
       endDate: i.endDate ? String(i.endDate).slice(0, 10) : '',
       timeWindowStart: i.timeWindow?.start || '',
       timeWindowEnd: i.timeWindow?.end || '',
       vehicleType: i.vehicleType || '',
       city: i.city || ''
    });
    setModal({ type: 'edit', id: i._id });
  };

  const handleSave = async () => {
    if (!form.title || !form.targetValue || !form.rewardAmount) return showToast('Required fields missing', 'error');
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.timeWindowStart || payload.timeWindowEnd) {
        payload.timeWindow = { start: payload.timeWindowStart, end: payload.timeWindowEnd };
      }
      if (!payload.vehicleType) payload.vehicleType = null;
      if (!payload.city) payload.city = null;

      if (modal === 'add') await incentivesAPI.create(payload);
      else await incentivesAPI.update(modal.id, payload);
      
      showToast(`Incentive ${modal === 'add' ? 'created' : 'updated'}`, 'success');
      setModal(null);
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id, currentIsActive) => {
    try {
      await incentivesAPI.toggleStatus(id);
      showToast(currentIsActive ? 'Disabled' : 'Enabled', 'success');
      fetch();
    } catch { showToast('Update failed', 'error'); }
  };

  const activeCount = incentives.filter(i => i.isActive).length;

  return (
    <div className="fade-in">
      <ToastContainer />


      {/* Premium Header */}
      <div className="premium-header flex justify-between items-center shadow-premium">
        <div className="flex gap-16 items-center" style={{ position: 'relative', zIndex: 2 }}>
          <HeaderIcon />
          <div>
            <h1 className="text-24 font-black mb-4">Driver Rewards</h1>
            <p className="opacity-75 text-13">Create and manage performance-based incentive programs for your fleet.</p>
          </div>
        </div>
        <button className="btn btn-primary shadow-orange hover-lift px-24 py-12 text-14 font-bold" onClick={openAdd} style={{ position: 'relative', zIndex: 2 }}>
          + New Program
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid-4 mb-24">
        <div className="kpi-card hover-lift transition-300">
          <div className="kpi-label">Active Programs</div>
          <div className="flex items-end gap-8">
            <div className="kpi-value">{activeCount}</div>
            <div className="badge b-green badge-sm mb-4">Live</div>
          </div>
        </div>
        <div className="kpi-card hover-lift transition-300">
          <div className="kpi-label">Total Drafts</div>
          <div className="kpi-value text-muted">{incentives.length - activeCount}</div>
        </div>
        <div className="kpi-card hover-lift transition-300">
          <div className="kpi-label">Primary Metric</div>
          <div className="kpi-value text-18 font-bold text-orange">Ride Count</div>
        </div>
        <div className="kpi-card hover-lift transition-300">
          <div className="kpi-label">System Health</div>
          <div className="flex items-center gap-6 mt-4">
            <div className="status-dot dot-green"></div>
            <span className="text-12 font-semibold">Automatic Tracking ON</span>
          </div>
        </div>
      </div>

      <div className="card shadow-premium overflow-hidden border-none" style={{ borderRadius: 16 }}>
        <div className="card-header bg-slate-50">
          <h2 className="card-title">Program Management</h2>
          <div className="badge b-gray">{incentives.length} Total Programs</div>
        </div>
        
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                   <th className="text-left pl-24">Incentive Detail</th>
                   <th>Goal (Target)</th>
                   <th>Reward Payout</th>
                   <th>Expiry</th>
                   <th>Status</th>
                   <th className="pr-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incentives.length === 0 ? (
                  <tr><td colSpan="6" className="p-40 text-center text-muted">No reward programs found. Create your first one to boost driver retention.</td></tr>
                ) : incentives.map((i) => (
                  <tr key={i._id} className="transition-150 hover:bg-slate-50">
                    <td className="text-left pl-24">
                      <div className="font-black text-14 text-text mb-2">{i.title}</div>
                      <div className="text-11 text-sub capitalize flex items-center gap-4">
                        <span className="badge b-blue badge-sm">{i.incentiveType.replace('_', ' ')}</span>
                        {i.city && <span className="text-muted">• {i.city}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col items-center">
                        <span className="font-black text-16">{i.targetValue}</span>
                        <span className="text-10 text-muted uppercase tracking-widest font-bold">Target</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col items-center">
                        <span className="font-black text-16 text-green">
                          {i.rewardType === 'per_ride' ? `₹${i.rewardAmount}/ride` : `₹${i.rewardAmount}`}
                        </span>
                        <span className="text-10 text-muted uppercase tracking-widest font-bold">
                          {i.rewardType === 'per_ride' ? 'Bonus' : 'Flat Payout'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-13 font-medium">{new Date(i.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                      <div className="text-10 text-muted">Valid Period</div>
                    </td>
                    <td>
                      <div onClick={() => handleToggle(i._id, i.isActive)} className="cursor-pointer">
                        <StatusBadge status={i.isActive ? 'active' : 'inactive'} />
                      </div>
                    </td>
                    <td className="pr-24">
                      <div className="flex gap-8 justify-center">
                        <button className="btn btn-outline btn-sm hover-lift px-12" onClick={() => openEdit(i)}>Edit</button>
                        <button 
                          className={`btn ${i.isActive ? 'btn-danger' : 'btn-primary shadow-orange'} btn-sm hover-lift px-12`} 
                          onClick={() => handleToggle(i._id, i.isActive)}
                        >
                          {i.isActive ? 'Disable' : 'Enable'}
                        </button>
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

      <Modal
        isOpen={!!modal} 
        onClose={() => setModal(null)}
        title={modal === 'add' ? '✨ Create New Incentive Plan' : '📝 Edit Program Details'} 
        maxWidthClass="max-w-640"
        footer={
          <>
            <button className="btn btn-outline px-24 py-10 font-bold" onClick={() => setModal(null)}>Discard</button>
            <button className="btn btn-primary shadow-orange px-32 py-10 font-black hover-lift" onClick={handleSave} disabled={saving}>
              {saving ? 'Processing...' : modal === 'add' ? 'Deploy Program' : 'Update Program'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-20 p-4">
          
          <div className="form-section p-16 rounded-16 border border-light bg-slate-50">
            <h4 className="form-label-premium">General Specification</h4>
            <div className="grid grid-cols-2 gap-16">
              <div className="form-group col-span-full">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Program Title *</label>
                <input className="form-input font-bold text-15 py-12 bg-white" placeholder="e.g. Weekend Super-Charger" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group col-span-full">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Driver Vision Statement</label>
                <textarea className="form-input bg-white" rows="2" placeholder="Describe the goal nicely for the drivers..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
              </div>
            </div>
          </div>

          <div className="form-section p-16 rounded-16 border border-light bg-slate-50">
            <h4 className="form-label-premium">Targets & Financials</h4>
            <div className="grid grid-cols-2 gap-16">
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Success Metric</label>
                <CustomSelect className="form-input font-semibold bg-white" value={form.incentiveType} onChange={e => setForm(f => ({ ...f, incentiveType: e.target.value }))}>
                  <option value="ride_count">Complete Total Rides</option>
                  <option value="earnings">Hit Earnings Goal</option>
                  <option value="peak_hours">Peak Hour Hero</option>
                  <option value="acceptance_rate">Perfect Acceptance</option>
                </CustomSelect>
              </div>
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Target Number *</label>
                <input type="number" className="form-input font-black text-18 bg-white" placeholder="e.g. 50" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Reward Model</label>
                <CustomSelect className="form-input font-semibold bg-white" value={form.rewardType} onChange={e => setForm(f => ({ ...f, rewardType: e.target.value }))}>
                  <option value="fixed">One-time Flat Payout</option>
                  <option value="per_ride">Bonus Per Specific Ride</option>
                </CustomSelect>
              </div>
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Amount (₹) *</label>
                <input type="number" className="form-input text-green font-black text-18 bg-green-50" value={form.rewardAmount} onChange={e => setForm(f => ({ ...f, rewardAmount: e.target.value }))} style={{ borderColor: '#86efac' }} />
              </div>
            </div>
          </div>

          <div className="form-section p-16 rounded-16 border border-light bg-slate-50">
            <h4 className="form-label-premium">Validity & Rules</h4>
            <div className="grid grid-cols-2 gap-16">
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Starts On</label>
                <input type="date" className="form-input bg-white" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Ends On</label>
                <input type="date" className="form-input bg-white" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">City / Region (Optional)</label>
                <input className="form-input bg-white" placeholder="e.g. Bangalore" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="text-11 uppercase font-black tracking-widest text-muted mb-4 block">Vehicle Type</label>
                <CustomSelect className="form-input bg-white" value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}>
                  <option value="">Open to All</option>
                  <option value="mini">Mini Only</option>
                  <option value="sedan">Sedan Premium</option>
                  <option value="suv">SUV XL</option>
                  <option value="bike">Buddy Bike</option>
                </CustomSelect>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
