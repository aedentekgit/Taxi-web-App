import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import { rentalPackagesAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

export default function RentalPackages() {
  const [packages, setPackages] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ search: '', page: 1 });
  const limit = 10;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    package_name: '',
    amount: '',
    status: 1,
    features: []
  });
  const [saving, setSaving] = useState(false);

  const { showToast, ToastContainer } = useToast();
  const confirm = useConfirm();

  const fetchPackages = useCallback(() => {
    setLoading(true);
    const params = { ...filters, limit };
    rentalPackagesAPI.getAll(params)
      .then(r => {
        setPackages(r.data.data);
        if (r.data.page) {
          setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages });
        }
      })
      .catch(() => showToast('Failed to load rental packages', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  const setPage = (p) => setFilters(f => ({ ...f, page: p }));

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleOpenForm = (pkg = null) => {
    if (pkg) {
      setFormData({
        id: pkg.id,
        package_name: pkg.package_name,
        amount: pkg.amount || '',
        status: pkg.status,
        features: Array.isArray(pkg.features) ? pkg.features : []
      });
    } else {
      setFormData({ id: null, package_name: '', amount: '', status: 1, features: [''] });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => setIsFormOpen(false);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleAddFeature = () => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  
  const handleRemoveFeature = (index) => setFormData(prev => ({ ...prev, features: formData.features.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.package_name.trim()) return showToast('Package name is required', 'error');
    if (!formData.amount) return showToast('Amount is required', 'error');

    setSaving(true);
    try {
      if (formData.id) {
        await rentalPackagesAPI.update(formData.id, formData);
        showToast('Rental package updated', 'success');
      } else {
        await rentalPackagesAPI.create(formData);
        showToast('Rental package added', 'success');
      }
      fetchPackages();
      handleCloseForm();
    } catch (error) { 
        showToast('Failed to save rental package', 'error'); 
    } 
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await rentalPackagesAPI.updateStatus(id, { status: newStatus });
      showToast('Status changed', 'success');
      setPackages(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (error) { showToast("Failed to update status", 'error'); }
  };

  const handleDelete = async (id) => {
    if (!await confirm('Delete Rental Package', 'Are you sure you want to delete this package?')) return;
    try {
      await rentalPackagesAPI.remove(id);
      showToast('Deleted successfully', 'success');
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (error) { showToast('Failed to delete', 'error'); }
  };

  return (
    <div>
      <ToastContainer />
      
      {/* Premium Header aligned with Drivers.jsx style */}
      <PageHeader 
        title="Rental Inventory" 
        description="Configure time-based packages, hourly rentals, and point-to-point pricing." 
        icon="📦" 
        statLabel="Fleet Units" 
        statValue={packages.length} statIcon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="22" height="22"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search packages..." value={filters.search} onChange={v => { setFilters(f => ({ ...f, search: v })); setPage(1); }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>+ Add Package</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="w-60">S NO</th>
                  <th>PACKAGE NAME</th>
                  <th>AMOUNT</th>
                  <th>FEATURES</th>
                  <th>STATUS</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted p-60">
                     <svg fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" width="48" height="48" className="mb-16 opacity-50 mx-auto block"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                     <div className="font-bold text-16">No rental packages yet</div>
                     <div className="text-13 mt-4">Start creating rental packages.</div>
                  </td></tr>
                )}
                {packages.map((pkg, index) => (
                  <tr key={pkg.id || pkg._id}>
                    <td>{((meta.page || 1) - 1) * limit + index + 1}</td>
                    <td className="font-black text-14 text-text tracking-wide text-center">{pkg.package_name}</td>
                    <td>
                      <span className="badge bg-blue-50 text-blue-900 border border-blue-200 font-black px-12 py-4">
                        ₹{parseFloat(pkg.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-6 w-full max-w-sm">
                        {Array.isArray(pkg.features) && pkg.features.slice(0, 2).map((f, i) => (
                          <span key={i} className="badge bg-slate-50 text-text text-11 font-bold border border-border px-10 py-2">
                             {f}
                          </span>
                        ))}
                        {pkg.features?.length > 2 && (
                          <span className="badge bg-slate-100 text-muted text-10 font-bold px-8 py-2 border-none">+{pkg.features.length - 2}</span>
                        )}
                        {!pkg.features?.length && <span className="text-muted text-11 italic">No features</span>}
                      </div>
                    </td>
                    <td>
                      <button className={`badge border ${pkg.status === 1 ? 'bg-green-50 text-green-700 border-green-500 border-opacity-20' : 'bg-red-50 text-red-600 border-red-500 border-opacity-20'} font-bold px-12 py-6 cursor-pointer hover:shadow-sm transition-150`} onClick={() => handleToggleStatus(pkg.id, pkg.status)}>
                        <span className={`status-dot ${pkg.status === 1 ? 'dot-green' : 'dot-red'} mr-6`} />
                        {pkg.status === 1 ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => handleOpenForm(pkg)} title="Edit">
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(pkg.id)} title="Delete">
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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

      {/* Premium Integration with standard Modal Component */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        maxWidthClass="max-w-440"
        title={
          <div className="flex items-center gap-12">
             <span className="av av-sm text-white" style={{ background: 'var(--blue)' }}>
               <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
             </span>
             <h2 className="text-16 font-black m-0 text-text tracking-wide uppercase">{formData.id ? 'Edit Package' : 'New Rental Package'}</h2>
          </div>
        }
        footer={
           <div className="flex gap-12 w-full justify-end">
              <button type="button" onClick={handleCloseForm} className="btn btn-outline font-bold px-20 border-1.5 border-border">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={saving} className="btn btn-primary font-bold px-24 py-10 shadow-sm rounded-20">
                 {saving ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Package'}
              </button>
           </div>
        }
      >
        <div className="flex flex-col gap-24">
            <div className="bg-slate-50 p-20 rounded-16 border border-border">
                <div className="form-group mb-20">
                    <label className="text-11 uppercase text-muted tracking-widest font-black mb-6 block">Package Name *</label>
                    <input type="text" required value={formData.package_name} onChange={(e) => setFormData({ ...formData, package_name: e.target.value })} className="form-input text-15 font-black bg-white shadow-sm border-transparent" placeholder="e.g. 8 Hrs / 80 Kms" />
                </div>
                <div className="form-group mb-0">
                    <label className="text-11 uppercase text-muted tracking-widest font-black mb-6 block">Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-12 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                      <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="form-input text-16 font-black bg-white shadow-sm border-transparent pl-24" placeholder="0.00" />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-12">
                    <label className="text-11 uppercase text-muted tracking-widest font-black m-0 flex items-center gap-6">
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="12" height="12"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      Package Features
                    </label>
                    <button type="button" onClick={handleAddFeature} className="badge bg-blue-50 text-blue-600 font-bold border-none px-10 py-4 text-11 cursor-pointer hover:bg-blue-100 transition-150">
                        + Add Line Item
                    </button>
                </div>
                
                <div className="flex flex-col gap-10">
                    {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-8 relative group">
                            <div className="flex-1 relative">
                               <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-12">•</span>
                               <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="form-input text-13 bg-slate-50 border-transparent shadow-sm flex-1 pl-24 focus:bg-white" placeholder="e.g. Extra Km @ ₹12" />
                            </div>
                            <button type="button" onClick={() => handleRemoveFeature(index)} className="btn btn-outline text-red-400 border-transparent hover:bg-red-50 hover:text-red-600 p-6 flex justify-center items-center rounded-8 transition-150" title="Remove Feature">
                                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                    {formData.features.length === 0 && (
                        <div className="text-center p-20 border border-dashed rounded-12 text-muted text-12 font-medium">No features added to this package</div>
                    )}
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
}
