import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import { destinationsAPI } from '../api/index.js';
import api from '../api/axios.js';
import { PageLoader } from '../components/Spinner.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = api.defaults.baseURL.replace('/api', ''); // Get base domain without /api
  return `${baseUrl}${url}`;
};

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ search: '', page: 1 });
  const limit = 10;
  
  const [view, setView] = useState('list');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ main: false, spots: {} });

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    slug: '',
    country: '',
    description: '',
    image: '',
    isActive: true,
    spots: []
  });

  const { showToast, ToastContainer } = useToast();
  const confirm = useConfirm();

  const fetchDestinations = useCallback(() => {
    setLoading(true);
    const params = { ...filters, limit };
    destinationsAPI.getAll(params)
      .then(r => {
        setDestinations(r.data.data);
        if (r.data.page) {
           setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages });
        }
      })
      .catch(() => showToast('Failed to load destinations', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  const setPage = (p) => setFilters(f => ({ ...f, page: p }));

  useEffect(() => { if (view === 'list') fetchDestinations(); }, [fetchDestinations, view]);

  const handleOpenForm = (dest = null) => {
    if (dest) {
      setFormData({
        id: dest.id,
        name: dest.name,
        slug: dest.slug || '',
        country: dest.country || '',
        description: dest.description || '',
        image: dest.image || '',
        isActive: dest.isActive,
        spots: Array.isArray(dest.spots) ? dest.spots : []
      });
    } else {
      setFormData({
        id: null, name: '', slug: '', country: '', description: '', image: '', isActive: true, spots: []
      });
    }
    setView('form');
  };

  const handleFileUpload = async (file, type, index = null) => {
    if (!file) return;
    if (file.size > 300 * 1024) return showToast('Image size must be less than 300KB', 'error');

    const form = new FormData();
    form.append('image', file);

    if (type === 'main') setUploading(prev => ({ ...prev, main: true }));
    else setUploading(prev => ({ ...prev, spots: { ...prev.spots, [index]: true } }));

    try {
      // Direct call since the endpoint is /api/upload
      const response = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (type === 'main') {
          setFormData(prev => ({ ...prev, image: response.data.imageUrl }));
      } else {
          handleSpotChange(index, 'image', response.data.imageUrl);
      }
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      showToast('Failed to upload image', 'error');
    } finally {
      if (type === 'main') setUploading(prev => ({ ...prev, main: false }));
      else setUploading(prev => ({ ...prev, spots: { ...prev.spots, [index]: false } }));
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSpotChange = (index, field, value) => {
    const newSpots = [...formData.spots];
    newSpots[index][field] = value;
    setFormData(f => ({ ...f, spots: newSpots }));
  };

  const addSpot = () => setFormData(f => ({ ...f, spots: [...f.spots, { name: '', description: '', image: '' }] }));
  const removeSpot = (index) => setFormData(f => ({ ...f, spots: f.spots.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return showToast('City Name is required', 'error');

    setSaving(true);
    const payload = { ...formData, spots: formData.spots.filter(s => s.name.trim() !== '') };
    try {
      if (formData.id) {
        await destinationsAPI.update(formData.id, payload);
        showToast('Destination updated successfully', 'success');
      } else {
        await destinationsAPI.create(payload);
        showToast('Destination created successfully', 'success');
      }
      setView('list');
    } catch (error) { 
        showToast(error.response?.data?.message || 'Failed to save destination', 'error'); 
    } 
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await destinationsAPI.updateStatus(id, { isActive: !isActive });
      showToast('Status changed', 'success');
      setDestinations(prev => prev.map(p => p.id === id ? { ...p, isActive: !isActive } : p));
    } catch (error) { showToast("Failed to update status", 'error'); }
  };

  const handleDelete = async (id) => {
    if (!await confirm('Delete Destination', 'Permanently delete this destination and its attractions?')) return;
    try {
      await destinationsAPI.remove(id);
      showToast('Deleted successfully', 'success');
      setDestinations(prev => prev.filter(p => p.id !== id));
    } catch (error) { showToast('Failed to delete', 'error'); }
  };

  // ----- Form View -----
  if (view === 'form') {
    return (
      <div className="max-w-720 w-full" style={{ margin: '0 auto', paddingBottom: '60px' }}>
        <ToastContainer />
        <div className="flex justify-between items-center mb-24 pb-16" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-16">
            <button className="btn btn-outline" onClick={() => setView('list')} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h2 className="m-0 text-text text-24 font-black tracking-wide">{formData.id ? 'Edit Destination' : 'Add New Destination'}</h2>
              <div className="text-12 text-muted mt-4 font-medium uppercase tracking-widest">Build travel destinations</div>
            </div>
          </div>
          <button className="btn btn-primary px-24 font-bold" disabled={saving} onClick={handleSubmit} style={{ height: '44px', borderRadius: '22px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {saving ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Destination'}
          </button>
        </div>

        {/* Basic Details Section */}
        <div className="card mb-24 overflow-hidden" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className="card-header bg-slate-50 border-none pb-16 pt-20">
            <div className="card-title flex items-center gap-8 text-16 font-black uppercase tracking-wide text-text">
               <span className="av av-sm text-white" style={{ background: 'var(--blue)' }}><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
               Basic Information
            </div>
          </div>
          <div className="card-body grid grid-cols-2 gap-20 pt-16">
            <div className="form-group">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">City Name *</label>
              <input name="name" className="form-input text-15 font-semibold" placeholder="e.g. Paris" value={formData.name} onChange={(e) => {
                  const val = e.target.value;
                  setFormData(f => ({ ...f, name: val, slug: formData.id ? f.slug : val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') }));
              }} />
            </div>
            <div className="form-group">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">URL Slug (SEO)</label>
              <input name="slug" className="form-input text-14" placeholder="e.g. paris" value={formData.slug} onChange={handleChange} />
            </div>
            <div className="form-group col-span-full">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Country</label>
              <input name="country" className="form-input text-14" placeholder="e.g. France" value={formData.country} onChange={handleChange} />
            </div>
            <div className="form-group col-span-full">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Description</label>
              <textarea name="description" className="form-input resize-y text-14 leading-relaxed" rows={3} placeholder="Describe the destination..." value={formData.description} onChange={handleChange} />
            </div>
            <div className="form-group col-span-full">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Cover Image (Max 300KB)</label>
              <div className="relative">
                <input name="image" className="form-input text-13 font-mono w-full" style={{ paddingRight: '120px' }} placeholder="Image URL or Upload..." value={formData.image} onChange={handleChange} />
                <label className={`absolute badge border-none font-bold px-12 py-6 cursor-pointer text-12 transition-150 mx-0 my-0 ${uploading.main ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} style={{ top: '50%', transform: 'translateY(-50%)', right: '6px' }}>
                    {uploading.main ? 'Uploading...' : 'Upload File'}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'main')} />
                </label>
              </div>
              {formData.image && <div className="mt-8 rounded-8 overflow-hidden h-140 bg-slate-100 relative group" style={{ backgroundImage: `url(${getImageUrl(formData.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)' }} />}
            </div>
          </div>
        </div>

        {/* Attractions Section */}
        <div className="mb-24">
          <div className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-8">
               <span className="av av-sm text-white" style={{ background: 'var(--orange)' }}><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
               <h3 className="text-16 font-black uppercase tracking-wide m-0">Top Attractions</h3>
            </div>
            <button className="btn text-orange font-bold px-16 py-8 hover:opacity-85 transition-150" style={{ background: 'var(--orange-light)' }} onClick={addSpot}>+ Add New Spot</button>
          </div>
          
          <div className="flex flex-col gap-16 relative">
            {formData.spots.length === 0 && <div className="text-center p-40 border border-dashed rounded-8 text-muted bg-white font-medium">No top attractions added.</div>}
            {formData.spots.map((spot, sIdx) => (
              <div key={sIdx} className="card p-20 relative bg-slate-50 transition-150 hover:bg-white hover:shadow-sm" style={{ border: '1px solid var(--border)', borderLeft: '4px solid var(--orange)' }}>
                <div className="flex justify-between items-start mb-16 pb-12 border-b border-border">
                  <span className="font-black text-12 text-orange uppercase tracking-widest mt-4">Attraction {sIdx + 1}</span>
                  <button className="text-muted hover:text-red-500 font-bold px-8 py-2 rounded-4 text-12 flex items-center gap-4 transition-150" onClick={() => removeSpot(sIdx)}>✕ <span className="opacity-75">Remove</span></button>
                </div>
                <div className="grid grid-cols-2 gap-16">
                  <div className="form-group col-span-1">
                    <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Spot Name</label>
                    <input className="form-input text-14 font-bold border-transparent bg-white shadow-sm" placeholder="e.g. Eiffel Tower" value={spot.name} onChange={e => handleSpotChange(sIdx, 'name', e.target.value)} />
                  </div>
                  <div className="form-group col-span-1">
                    <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Image (Max 300KB)</label>
                    <div className="relative flex items-center">
                      <input className="form-input text-13 border-transparent bg-white shadow-sm w-full" style={{ paddingRight: '40px' }} placeholder="URL or upload" value={spot.image} onChange={e => handleSpotChange(sIdx, 'image', e.target.value)} />
                      <label className={`absolute badge border-none font-bold px-8 py-4 cursor-pointer text-10 transition-150 mx-0 my-0 ${uploading.spots[sIdx] ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} style={{ top: '50%', transform: 'translateY(-50%)', right: '8px' }} title="Upload Image">
                          {uploading.spots[sIdx] ? '...' : <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="12" height="12"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>}
                          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'spot', sIdx)} />
                      </label>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Description</label>
                    <textarea className="form-input text-13 resize-y border-transparent bg-white shadow-sm" rows="2" placeholder="Describe the spot..." value={spot.description} onChange={e => handleSpotChange(sIdx, 'description', e.target.value)} />
                  </div>
                  {spot.image && (
                    <div className="col-span-full rounded-8 overflow-hidden h-80 bg-slate-100 mt-4" style={{ backgroundImage: `url(${getImageUrl(spot.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----- List View -----
  return (
    <div>
      <ToastContainer />
      


      <PageHeader 
        title="Destinations" 
        description="Manage popular drop-offs and tour locations." 
        icon="📍" 
        statLabel="Total Records" 
        statValue={destinations?.length || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search destinations..." value={filters.search} onChange={v => { setFilters(f => ({ ...f, search: v })); setPage(1); }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => handleOpenForm(null)}>+ Add Destination</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="w-60">S NO</th><th>CITY</th><th>COUNTRY</th><th>ATTRACTIONS</th><th>STATUS</th><th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {destinations.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted p-60">
                     <svg fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" width="48" height="48" className="mb-16 opacity-50 mx-auto block"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                     <div className="font-bold text-16">No destinations built yet</div>
                     <div className="text-13 mt-4">Start creating target destinations.</div>
                  </td></tr>
                )}
                {destinations.map((dest, index) => (
                  <tr key={dest.id || dest._id}>
                    <td>{((meta.page || 1) - 1) * limit + index + 1}</td>
                    <td className="text-left">
                      <div className="flex items-center gap-16">
                        {dest.image ? (
                          <div className="av av-xl rounded-10 shadow-sm" style={{ width: '64px', height: '48px', backgroundImage: `url(${getImageUrl(dest.image)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        ) : (
                          <div className="av av-xl rounded-10 bg-border-light text-muted font-black flex items-center justify-center text-12 uppercase" style={{ width: '64px', height: '48px' }}>IMG</div>
                        )}
                        <div>
                           <div className="font-black text-14 text-text tracking-wide">{dest.name}</div>
                           <div className="text-12 text-muted font-medium mt-2">Slug: {dest.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-13 font-bold text-slate-700">{dest.country}</td>
                    <td><span className="badge bg-blue-50 text-blue-800 font-bold px-10 py-4">{dest.spots?.length || 0} spots</span></td>
                    <td>
                      <button className={`badge border ${dest.isActive ? 'bg-green-50 text-green-700 border-green-500 border-opacity-20' : 'bg-red-50 text-red-600 border-red-500 border-opacity-20'} font-bold px-12 py-6 cursor-pointer hover:shadow-sm`} onClick={() => handleToggleStatus(dest.id, dest.isActive)}>
                        <span className={`status-dot ${dest.isActive ? 'dot-green' : 'dot-red'} mr-6`} />
                        {dest.isActive ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => handleOpenForm(dest)} title="Edit">
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(dest.id)} title="Delete">
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
    </div>
  );
}
