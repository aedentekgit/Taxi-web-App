import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { packagesAPI } from '../api/index.js';
import api from '../api/axios.js';
import { PageLoader } from '../components/Spinner.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

const ACTIVITY_TYPES = [
  { value: 'transfer', label: 'Transfer', color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'sightseeing', label: 'Sightseeing', color: 'text-green-500', bg: 'bg-green-50' },
  { value: 'meal', label: 'Meal', color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'stay', label: 'Stay', color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'flight', label: 'Flight', color: 'text-red-500', bg: 'bg-red-50' }
];

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = api.defaults.baseURL.replace('/api', ''); // Get base domain without /api
  return `${baseUrl}${url}`;
};

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ search: '', page: 1 });
  
  const [view, setView]         = useState('list');
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState({ main: false, activities: {} });
  const [formData, setFormData] = useState({
    title: '', slug: '', location: '', duration: '', people: '2 Adults',
    price: '', discount_price: '', image: '', description: '',
    inclusions: [], itinerary: [], is_featured: false, rating: 5.0,
    transport: 'Private Cab', best_time: 'All Year', quality: 'Premium'
  });

  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetch = useCallback(() => {
    setLoading(true);
    packagesAPI.getAll(filters)
      .then(r => { setPackages(r.data.data); setMeta(r.data); })
      .catch(() => showToast('Failed to load packages', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { if (view === 'list') fetch(); }, [fetch, view]);

  const handleDelete = async (id) => {
    if (!await confirmDialog('Are you sure you want to permanently delete this package?')) return;
    try {
      await packagesAPI.remove(id);
      showToast('Package deleted', 'success');
      fetch();
    } catch { showToast('Deletion failed', 'error'); }
  };

  const handleFileUpload = async (file, type, dayIndex = null, actIndex = null) => {
    if (!file) return;
    if (file.size > 300 * 1024) return showToast('Image size must be less than 300KB', 'error');

    const form = new FormData();
    form.append('image', file);

    if (type === 'main') setUploading(prev => ({ ...prev, main: true }));
    else setUploading(prev => ({ ...prev, activities: { ...prev.activities, [`${dayIndex}-${actIndex}`]: true } }));

    try {
      const response = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (type === 'main') {
          setFormData(prev => ({ ...prev, image: response.data.imageUrl }));
      } else {
          updateActivity(dayIndex, actIndex, 'image', response.data.imageUrl);
      }
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      showToast('Failed to upload image', 'error');
    } finally {
      if (type === 'main') setUploading(prev => ({ ...prev, main: false }));
      else setUploading(prev => ({ ...prev, activities: { ...prev.activities, [`${dayIndex}-${actIndex}`]: false } }));
    }
  };

  const openForm = (pkg = null) => {
    if (pkg) {
      setFormData({
        ...pkg,
        inclusions: pkg.inclusions || [],
        itinerary: pkg.itinerary || []
      });
    } else {
      setFormData({
        title: '', slug: '', location: '', duration: '', people: '2 Adults',
        price: '', discount_price: '', image: '', description: '',
        inclusions: [], itinerary: [{ day: 1, title: 'Arrival', activities: [] }],
        is_featured: false, rating: 5.0, transport: 'Private Cab', best_time: 'All Year', quality: 'Premium'
      });
    }
    setView('form');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const addDay = () => setFormData(f => ({ ...f, itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: '', activities: [] }] }));
  const removeDay = (index) => setFormData(f => ({ ...f, itinerary: f.itinerary.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 })) }));
  
  const updateDayTitle = (index, value) => {
    const fresh = [...formData.itinerary];
    fresh[index].title = value;
    setFormData(f => ({ ...f, itinerary: fresh }));
  };

  const addActivity = (dayIndex, type) => {
    const fresh = [...formData.itinerary];
    fresh[dayIndex].activities = [...(fresh[dayIndex].activities || []), { type, title: '', subtitle: '', description: '', image: '' }];
    setFormData(f => ({ ...f, itinerary: fresh }));
  };

  const removeActivity = (dayIndex, actIndex) => {
    const fresh = [...formData.itinerary];
    fresh[dayIndex].activities = fresh[dayIndex].activities.filter((_, i) => i !== actIndex);
    setFormData(f => ({ ...f, itinerary: fresh }));
  };

  const updateActivity = (dayIndex, actIndex, field, value) => {
    const fresh = [...formData.itinerary];
    fresh[dayIndex].activities[actIndex][field] = value;
    setFormData(f => ({ ...f, itinerary: fresh }));
  };

  const [incInput, setIncInput] = useState('');
  const addInclusion = () => {
    if (incInput.trim()) {
      setFormData(f => ({ ...f, inclusions: [...f.inclusions, incInput.trim()] }));
      setIncInput('');
    }
  };

  const handleSave = async () => {
    if (!formData.title) return showToast('Title is required', 'error');
    setSaving(true);
    try {
      if (formData._id) await packagesAPI.update(formData._id, formData);
      else await packagesAPI.create(formData);
      showToast('Package saved successfully', 'success');
      setView('list');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await packagesAPI.toggleStatus(id);
      showToast('Status changed', 'success');
      fetch();
    } catch { showToast('Update failed', 'error'); }
  };

  if (view === 'form') {
    return (
      <div className="max-w-720 w-full" style={{ margin: '0 auto', paddingBottom: '60px' }}>
        <ToastContainer />
        
        {/* Premium Form Header */}
        <div className="flex justify-between items-center mb-24 pb-16" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-16">
            <button className="btn btn-outline" onClick={() => setView('list')} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h2 className="m-0 text-text text-24 font-black tracking-wide">{formData._id ? 'Edit Tour Package' : 'Create New Package'}</h2>
              <div className="text-12 text-muted mt-4 font-medium uppercase tracking-widest">Build an immersive travel experience</div>
            </div>
          </div>
          <button className="btn btn-primary px-24 font-bold" disabled={saving} onClick={handleSave} style={{ height: '44px', borderRadius: '22px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 14px rgba(232, 119, 34, 0.3)' }}>
            {saving ? 'Processing...' : formData._id ? 'Save Changes' : 'Publish Package'}
          </button>
        </div>

        {/* Basic Details Section */}
        <div className="card mb-24 overflow-hidden" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className="card-header bg-slate-50 border-none pb-16 pt-20">
            <div className="card-title flex items-center gap-8 text-16 font-black uppercase tracking-wide text-text">
               <span className="av av-sm text-white" style={{ background: 'var(--blue)' }}><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
               Basic Overview
            </div>
          </div>
          <div className="card-body grid grid-cols-2 gap-20 pt-16">
            <div className="form-group col-span-full">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Package Title *</label>
              <input name="title" className="form-input text-15 font-semibold" placeholder="e.g. Majestic Mountains Getaway" value={formData.title} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Location</label>
              <input name="location" className="form-input text-14" placeholder="e.g. Manali, Himachal Pradesh" value={formData.location} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Duration</label>
              <input name="duration" className="form-input text-14" placeholder="e.g. 3 Days 2 Nights" value={formData.duration} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">List Price (₹)</label>
              <input type="number" name="price" className="form-input text-14" placeholder="0" value={formData.price} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Discounted Price (₹)</label>
              <input type="number" name="discount_price" className="form-input text-15 text-green-600 font-bold bg-green-50" placeholder="0" value={formData.discount_price} onChange={handleFormChange} style={{ borderColor: '#86efac' }} />
            </div>
            <div className="form-group col-span-full">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Cover Image (Max 300KB)</label>
              <div className="relative">
                <input name="image" className="form-input text-13 font-mono w-full" style={{ paddingRight: '120px' }} placeholder="Image URL or Upload..." value={formData.image} onChange={handleFormChange} />
                <label className={`absolute badge border-none font-bold px-12 py-6 cursor-pointer text-12 transition-150 mx-0 my-0 ${uploading.main ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} style={{ top: '50%', transform: 'translateY(-50%)', right: '6px' }}>
                    {uploading.main ? 'Uploading...' : 'Upload File'}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'main')} />
                </label>
              </div>
              {formData.image && <div className="mt-8 rounded-8 overflow-hidden h-140 bg-slate-100" style={{ backgroundImage: `url(${getImageUrl(formData.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)' }} />}
            </div>
            <div className="form-group col-span-full">
              <label className="text-11 uppercase text-muted tracking-widest font-bold mb-4">Marketing Description</label>
              <textarea name="description" className="form-input resize-y text-14 leading-relaxed" rows={4} placeholder="Describe the experience to attract tourists..." value={formData.description} onChange={handleFormChange} />
            </div>
          </div>
        </div>

        {/* Inclusions Section */}
        <div className="card mb-24 overflow-hidden" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className="card-header bg-slate-50 border-none pb-16 pt-20">
            <div className="card-title flex items-center gap-8 text-16 font-black uppercase tracking-wide text-text">
               <span className="av av-sm text-white" style={{ background: 'var(--green)' }}><svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
               What's Included
            </div>
          </div>
          <div className="card-body pt-16">
            <div className="flex gap-12 mb-20">
              <input className="form-input flex-1 text-14" value={incInput} onChange={e=>setIncInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInclusion())} placeholder="E.g., Complimentary Breakfast" />
              <button className="btn btn-outline font-bold px-20 border-1.5" onClick={addInclusion}>Add Tag</button>
            </div>
            <div className="flex flex-wrap gap-10">
              {formData.inclusions.length === 0 && <span className="text-13 text-muted italic">No inclusions added yet.</span>}
              {formData.inclusions.map((inc, i) => (
                <span key={i} className="badge bg-green-50 text-green-700 flex items-center gap-8 py-6 px-14 text-13 border border-green-500 border-opacity-20" style={{ borderRadius: '20px' }}>
                  {inc}
                  <button className="text-green-600 hover:bg-green-100 rounded-full p-2 d-flex items-center justify-center transition-150" onClick={() => setFormData(f => ({...f, inclusions: f.inclusions.filter((_, idx)=>idx!==i)}))}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary Timeline Section */}
        <div className="mb-24">
          <div className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-8">
               <span className="av av-sm text-white" style={{ background: 'var(--orange)' }}><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
               <h3 className="text-16 font-black uppercase tracking-wide m-0">Itinerary Timeline</h3>
            </div>
            <button className="btn text-orange font-bold px-16 py-8 hover:opacity-85 transition-150" style={{ background: 'var(--orange-light)' }} onClick={addDay}>+ Add New Day</button>
          </div>
          
          <div className="flex flex-col relative">
             {/* Subtle timeline track line behind days */}
             {formData.itinerary.length > 1 && <div className="absolute top-0 bottom-0 left-24 w-2 bg-border-light" style={{ zIndex: 0, transform: 'translateX(-50%)' }} />}

            {formData.itinerary.length === 0 && <div className="text-center p-40 border border-dashed rounded-8 text-muted mb-24">No itinerary days planned.</div>}

            {formData.itinerary.map((day, dIdx) => (
              <div key={dIdx} className="card p-20 relative z-10 mb-20" style={{ border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', borderLeft: '4px solid var(--orange)' }}>
                <div className="flex justify-between items-start mb-20 pb-16 border-b border-border shadow-sm">
                  <div className="flex flex-col gap-8 flex-1 mr-24">
                    <span className="font-black text-12 text-orange uppercase tracking-widest">Day {day.day}</span>
                    <input className="form-input font-black text-18 h-40 border-transparent bg-slate-50 border-1.5 focus:border-orange rounded-8 transition-150" placeholder="e.g. Arrival & Hotel Check-in" value={day.title} onChange={(e) => updateDayTitle(dIdx, e.target.value)} />
                  </div>
                  <button className="btn btn-outline text-red-500 hover:border-red-500 hover:bg-red-50 px-12 py-8 mt-24 flex items-center gap-6" onClick={() => removeDay(dIdx)} title="Delete Day">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    <span className="font-bold text-12">Delete Day</span>
                  </button>
                </div>

                {/* Activity Adder Buttons */}
                <div className="flex flex-wrap gap-8 mb-20">
                  {ACTIVITY_TYPES.map(type => (
                    <button key={type.value} className={`badge-sm ${type.bg} ${type.color} border border-transparent hover:border-current cursor-pointer text-12 font-bold px-12 py-6 transition-150`} onClick={() => addActivity(dIdx, type.value)}>
                      + Add {type.label}
                    </button>
                  ))}
                </div>

                {/* Activities List */}
                <div className="flex flex-col gap-16">
                  {day.activities?.length === 0 && <div className="text-12 text-muted italic">No activities added for this day.</div>}
                  {day.activities?.map((act, aIdx) => {
                    const typeTheme = ACTIVITY_TYPES.find(t=>t.value===act.type) || ACTIVITY_TYPES[0];
                    return (
                      <div key={aIdx} className="p-16 border border-border border-dashed rounded-10 bg-slate-50 relative transition-150 hover:bg-white hover:border-solid hover:shadow-sm">
                         <div className="flex justify-between items-center mb-16">
                           <div className={`text-11 font-black uppercase tracking-widest px-8 py-4 rounded-4 ${typeTheme.bg} ${typeTheme.color}`}>
                             {typeTheme.label}
                           </div>
                           <button className="text-muted hover:text-red-500 font-bold px-8 py-2 rounded-4 text-12 flex items-center gap-4 transition-150" onClick={() => removeActivity(dIdx, aIdx)}>✕ <span className="opacity-75">Remove</span></button>
                         </div>
                         <div className="grid grid-cols-2 gap-16">
                           <div className="col-span-full">
                             <input className="form-input text-14 font-bold border-transparent bg-white shadow-sm" placeholder="Primary Activity Name" value={act.title} onChange={e => updateActivity(dIdx, aIdx, 'title', e.target.value)} />
                           </div>
                           <div className="col-span-full">
                             <input className="form-input text-13 border-transparent bg-white shadow-sm" placeholder="Location or Subtitle (Optional)" value={act.subtitle} onChange={e => updateActivity(dIdx, aIdx, 'subtitle', e.target.value)} />
                           </div>
                           <div className="col-span-full">
                             <textarea className="form-input text-13 resize-y border-transparent bg-white shadow-sm" rows="2" placeholder="Describe the experiences..." value={act.description} onChange={e => updateActivity(dIdx, aIdx, 'description', e.target.value)} />
                           </div>
                           <div className="col-span-full">
                             <div className="relative">
                               <input className="form-input text-13 font-mono border-transparent bg-white shadow-sm w-full" style={{ paddingRight: '120px' }} placeholder="Photo URL (Optional)" value={act.image} onChange={e => updateActivity(dIdx, aIdx, 'image', e.target.value)} />
                               <label className={`absolute badge border-none font-bold px-12 py-6 cursor-pointer text-12 transition-150 mx-0 my-0 ${uploading.activities && uploading.activities[`${dIdx}-${aIdx}`] ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} style={{ top: '50%', transform: 'translateY(-50%)', right: '6px' }}>
                                   {uploading.activities && uploading.activities[`${dIdx}-${aIdx}`] ? '...' : 'Upload'}
                                   <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'activity', dIdx, aIdx)} />
                               </label>
                             </div>
                             {act.image && <div className="mt-8 rounded-8 overflow-hidden h-80 bg-slate-100" style={{ backgroundImage: `url(${getImageUrl(act.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)' }} />}
                           </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // --- List View Premium Rewrite ---
  return (
    <div>
      <ToastContainer />
      
      {/* Premium Header aligned with Drivers.jsx style */}
      <PageHeader 
        title="Tour Experiences" 
        description="Curate immersive travel itineraries, manage seasonal pricing, and track leads." 
        icon="🗺️" 
        statLabel="Total Tours" 
        statValue={meta?.total || 0} 
      />

      <div className="filter-bar">
        <SearchInput placeholder="Search packages by location or title..." value={filters.search} onChange={v => setFilters(f => ({ ...f, search: v, page: 1 }))} />
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => openForm(null)}>+ Create New Package</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="w-60">S NO</th><th>PACKAGE</th><th>DURATION</th><th>PRICE TAGS</th><th>STATUS</th><th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted p-60">
                     <svg fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" width="48" height="48" className="mb-16 opacity-50 mx-auto block"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                     <div className="font-bold text-16">No packages built yet</div>
                     <div className="text-13 mt-4">Start creating itineraries to generate leads.</div>
                  </td></tr>
                )}
                {packages.map((pkg, index) => (
                  <tr key={pkg._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + index + 1}</td>
                    <td className="text-left">
                      <div className="flex items-center gap-16">
                        {pkg.image ? (
                          <div className="av av-xl rounded-10 shadow-sm" style={{ width: '64px', height: '48px', backgroundImage: `url(${getImageUrl(pkg.image)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        ) : (
                          <div className="av av-xl rounded-10 bg-border-light text-muted font-black" style={{ width: '64px', height: '48px' }}>IMG</div>
                        )}
                        <div>
                           <div className="font-black text-14 text-text tracking-wide">{pkg.title}</div>
                           <div className="text-12 text-muted font-medium flex items-center gap-4 mt-2">
                             <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                             {pkg.location || 'Anywhere'}
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-13 font-semibold text-text">{pkg.duration || '—'}</td>
                    <td>
                      <div className="font-black text-green-600 text-15">₹{pkg.discount_price || pkg.price}</div>
                      {pkg.discount_price && pkg.price && <div className="text-11 text-muted line-through font-medium">₹{pkg.price} list</div>}
                    </td>
                    <td>
                      <button className={`badge border ${pkg.isActive ? 'bg-green-50 text-green-700 border-green-500 border-opacity-20' : 'bg-red-50 text-red-600 border-red-500 border-opacity-20'} font-bold px-12 py-6 cursor-pointer hover:shadow-sm`} onClick={() => handleToggleStatus(pkg._id)}>
                        <span className={`status-dot ${pkg.isActive ? 'dot-green' : 'dot-red'} mr-6`} />
                        {pkg.isActive ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => openForm(pkg)} title="Edit">
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(pkg._id)} title="Delete">
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
        <Pagination meta={meta} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
      </div>
    </div>
  );
}
