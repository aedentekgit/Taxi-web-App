import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import { pricingAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

const BLANK_PRICING = {
  vehicle_type: '',
  rental_price: '',
  roundtrip_price: '',
  base_fare: '',
  driver_bata: '',
  min_km: '',
  night_charges: '',
  hill_charges: '',
  day_rent: '',
  day_rent_single: false,
  day_rent_round: true,
  offer: 'Best Price',
  feature1: '',
  feature2: '',
  feature3: '',
  feature4: '',
  feature5: '',
  status: 1
};

export default function Pricing() {
  const [pricingData, setPricingData] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage]         = useState(1);
  const limit = 10;
  
  const [modal, setModal]       = useState(null); // 'add' | { type: 'edit', id }
  const [form, setForm]         = useState(BLANK_PRICING);
  const [iconFile, setIconFile] = useState(null);
  const [saving, setSaving]     = useState(false);
  
  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetchPricing = useCallback(() => {
    setLoading(true);
    pricingAPI.getAll({ search: searchTerm, page, limit })
      .then(r => {
        setPricingData(r.data.data);
        if (r.data.page) {
          setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages });
        }
      })
      .catch(() => showToast('Failed to load pricing data', 'error'))
      .finally(() => setLoading(false));
  }, [searchTerm, page]);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  const openAdd = () => {
    setForm(BLANK_PRICING);
    setIconFile(null);
    setModal('add');
  };

  const openEdit = (item) => {
    setForm({
      vehicle_type: item.vehicle_type || '',
      rental_price: item.rental_price || '',
      roundtrip_price: item.roundtrip_price || '',
      base_fare: item.base_fare || '',
      driver_bata: item.driver_bata || '',
      min_km: item.min_km || '',
      night_charges: item.night_charges || '',
      hill_charges: item.hill_charges || '',
      day_rent: item.day_rent || '',
      day_rent_single: !!item.day_rent_single,
      day_rent_round: !!item.day_rent_round,
      offer: item.offer || '',
      feature1: item.feature1 || '',
      feature2: item.feature2 || '',
      feature3: item.feature3 || '',
      feature4: item.feature4 || '',
      feature5: item.feature5 || '',
      status: item.status !== undefined ? item.status : 1
    });
    setIconFile(null);
    setModal({ type: 'edit', id: item._id });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.vehicle_type || !form.rental_price || !form.roundtrip_price) {
      return showToast('Vehicle Type, Rental Price, and Roundtrip Price are required', 'error');
    }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.keys(form).forEach(key => payload.append(key, form[key]));
      if (iconFile) payload.append('icon_file', iconFile);

      if (modal === 'add') {
        await pricingAPI.create(payload);
      } else {
        await pricingAPI.update(modal.id, payload);
      }
      
      showToast(`Pricing ${modal === 'add' ? 'created' : 'updated'}`, 'success');
      setModal(null);
      fetchPricing();
    } catch (e) {
      showToast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this pricing configuration?'))) return;
    try {
      await pricingAPI.remove(id);
      showToast('Deleted successfully', 'success');
      fetchPricing();
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await pricingAPI.updateStatus(id, { status: newStatus });
      showToast('Status updated', 'success');
      fetchPricing();
    } catch { showToast('Status update failed', 'error'); }
  };

  // Removed client-side filter code


  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Pricing Management" 
        description="Configure vehicle base fares, rental rates, and extra charges." 
        icon="🏷️" 
        statLabel="Total Configurations"
        statValue={meta?.total || 0}
      />

      <div className="filter-bar">
        <SearchInput 
          placeholder="Search vehicles..." 
          value={searchTerm} 
          onChange={v => { setSearchTerm(v); setPage(1); }} 
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Pricing</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="w-60">S NO</th>
                  <th>VEHICLE</th>
                  <th>RENTAL / KM</th>
                  <th>ROUND TRIP</th>
                  <th>MIN KM</th>
                  <th>STATUS</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted p-40">No pricing configurations found</td></tr>
                )}
                {pricingData.map((item, index) => (
                  <tr key={item._id}>
                    <td>{((page - 1) * limit) + index + 1}</td>
                    <td>
                      <div className="font-bold text-14">{item.vehicle_type}</div>
                      <div className="text-11 text-muted">{item.offer}</div>
                    </td>
                    <td className="font-semibold text-13">₹{item.rental_price}</td>
                    <td className="font-semibold text-13">₹{item.roundtrip_price}</td>
                    <td>{item.min_km} km</td>
                    <td>
                      <button className={`badge border ${item.status === 1 ? 'bg-green-50 text-green-700 border-green-500 border-opacity-20' : 'bg-red-50 text-red-600 border-red-500 border-opacity-20'} font-bold px-12 py-6 cursor-pointer hover:shadow-sm`} 
                        onClick={() => handleToggleStatus(item._id, item.status)}>
                        <span className={`status-dot ${item.status === 1 ? 'dot-green' : 'dot-red'} mr-6`} />
                        {item.status === 1 ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => openEdit(item)} title="Edit">
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item._id)} title="Delete">
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

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Vehicle Pricing' : 'Edit Vehicle Pricing'}
        maxWidthClass="max-w-720"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Pricing'}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-16 shrink-0 pt-8" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <div className="form-group col-span-full">
            <h4 className="text-12 font-bold text-sub uppercase tracking-wider mb-8 mt-4 border-b pb-4">Vehicle Details</h4>
          </div>

          <div className="form-group col-span-full">
            <label>Vehicle Type *</label>
            <input name="vehicle_type" className="form-input font-bold" placeholder="e.g. Sedan, SUV" value={form.vehicle_type} onChange={handleFormChange} required />
          </div>
          
          <div className="form-group">
            <label>Icon Upload (Optional)</label>
            <input type="file" className="form-input py-6" onChange={e => setIconFile(e.target.files[0])} accept="image/*" />
          </div>

          <div className="form-group">
            <label>Promo Offer Tag</label>
            <input name="offer" className="form-input" placeholder="e.g. Best Price" value={form.offer} onChange={handleFormChange} />
          </div>

          <div className="form-group col-span-full">
            <h4 className="text-12 font-bold text-sub uppercase tracking-wider mb-8 mt-12 border-b pb-4">Core Pricing Setup</h4>
          </div>

          <div className="form-group">
            <label>Rental Price / Km (₹) *</label>
            <input type="number" name="rental_price" className="form-input font-bold text-orange" value={form.rental_price} onChange={handleFormChange} />
          </div>

          <div className="form-group">
            <label>Round Trip Price / Km (₹) *</label>
            <input type="number" name="roundtrip_price" className="form-input font-bold text-orange" value={form.roundtrip_price} onChange={handleFormChange} />
          </div>

          <div className="form-group">
            <label>Base Fare (₹)</label>
            <input type="number" name="base_fare" className="form-input" value={form.base_fare} onChange={handleFormChange} />
          </div>

          <div className="form-group">
            <label>Minimum KM</label>
            <input type="number" name="min_km" className="form-input" value={form.min_km} onChange={handleFormChange} />
          </div>

          <div className="form-group col-span-full">
            <h4 className="text-12 font-bold text-sub uppercase tracking-wider mb-8 mt-12 border-b pb-4">Extra & Day Charges</h4>
          </div>

          <div className="form-group">
            <label>Driver Bata (₹)</label>
            <input type="number" name="driver_bata" className="form-input" value={form.driver_bata} onChange={handleFormChange} />
          </div>

          <div className="form-group">
            <label>Night Charges (₹)</label>
            <input type="number" name="night_charges" className="form-input" value={form.night_charges} onChange={handleFormChange} />
          </div>

          <div className="form-group">
            <label>Hill Charges (₹)</label>
            <input type="number" name="hill_charges" className="form-input" value={form.hill_charges} onChange={handleFormChange} />
          </div>

          <div className="form-group">
            <label>Day Rent (₹)</label>
            <input type="number" name="day_rent" className="form-input" value={form.day_rent} onChange={handleFormChange} />
          </div>
          
          <div className="form-group col-span-full flex gap-16 pt-8">
             <label className="flex items-center gap-8 cursor-pointer">
               <input type="checkbox" name="day_rent_single" checked={form.day_rent_single} onChange={handleFormChange} />
               <span className="text-13 font-semibold">Apply Day Rent on Single Trip</span>
             </label>
             <label className="flex items-center gap-8 cursor-pointer">
               <input type="checkbox" name="day_rent_round" checked={form.day_rent_round} onChange={handleFormChange} />
               <span className="text-13 font-semibold">Apply Day Rent on Round Trip</span>
             </label>
          </div>

          <div className="form-group col-span-full">
            <h4 className="text-12 font-bold text-sub uppercase tracking-wider mb-8 mt-12 border-b pb-4">Features List Component</h4>
          </div>

          <div className="form-group">
            <input name="feature1" className="form-input" placeholder="Feature 1 (e.g. AC Included)" value={form.feature1} onChange={handleFormChange} />
          </div>
          <div className="form-group">
            <input name="feature2" className="form-input" placeholder="Feature 2 (e.g. 4 Seats)" value={form.feature2} onChange={handleFormChange} />
          </div>
          <div className="form-group">
            <input name="feature3" className="form-input" placeholder="Feature 3 (e.g. Fastag Extra)" value={form.feature3} onChange={handleFormChange} />
          </div>
          <div className="form-group">
            <input name="feature4" className="form-input" placeholder="Feature 4 (Optional)" value={form.feature4} onChange={handleFormChange} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
