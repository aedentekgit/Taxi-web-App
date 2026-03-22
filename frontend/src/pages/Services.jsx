import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import { servicesAPI } from '../api/index.js';
import api from '../api/axios.js';
import { PageLoader } from '../components/Spinner.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = api.defaults.baseURL.replace('/api', '');
  return `${baseUrl}${url}`;
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ search: '', page: 1 });
  const limit = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ main: false });
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    content: '',
    image: '',
    icon_svg: '',
    isActive: true
  });

  const { showToast, ToastContainer } = useToast();
  const confirm = useConfirm();

  const fetchServices = useCallback(() => {
    setLoading(true);
    const params = { ...filters, limit };
    servicesAPI.getAll(params)
      .then(r => {
        setServices(r.data.data);
        if (r.data.page) {
          setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages });
        }
      })
      .catch(() => showToast('Failed to load services', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  const setPage = (p) => setFilters(f => ({ ...f, page: p }));

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setFormData({
        id: service.id,
        title: service.title,
        slug: service.slug || '',
        content: service.content,
        image: service.image || '',
        icon_svg: service.icon_svg || '',
        isActive: service.isActive
      });
    } else {
      setFormData({ id: null, title: '', slug: '', content: '', image: '', icon_svg: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFileUpload = async (file, type = 'main') => {
    if (!file) return;
    if (file.size > 500 * 1024) return showToast('Image size must be less than 500KB', 'error');
    
    const form = new FormData();
    form.append('image', file);

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: res.data.imageUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSvgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFormData(p => ({ ...p, icon_svg: e.target.result }));
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title) return showToast('Title is required', 'error');

    setSaving(true);
    try {
      if (formData.id) {
        await servicesAPI.update(formData.id, formData);
        showToast('Service updated successfully', 'success');
      } else {
        await servicesAPI.create(formData);
        showToast('Service created successfully', 'success');
      }
      fetchServices();
      handleCloseModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save service', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm('Delete Service', 'Are you sure you want to delete this service?')) return;
    try {
      await servicesAPI.remove(id);
      showToast('Deleted successfully', 'success');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) { showToast('Failed to delete', 'error'); }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await servicesAPI.toggleStatus(id, { isActive: !isActive });
      showToast('Status updated', 'success');
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !isActive } : s));
    } catch (error) { showToast("Failed to update status", 'error'); }
  };

  return (
    <div>
      <ToastContainer />
      
      {/* Premium Header aligned with Drivers.jsx style */}
      <PageHeader 
        title="Service Ecosystem" 
        description="Configure primary offerings, core features, and branded iconography." 
        icon="🛠️" 
        statLabel="Total Records" 
        statValue={services?.length || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search services..." value={filters.search} onChange={v => { setFilters(f => ({ ...f, search: v })); setPage(1); }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add New Service</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="w-60">S NO</th>
                  <th>IMAGE</th>
                  <th>ICON</th>
                  <th>SERVICE NAME</th>
                  <th>STATUS</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted p-60">
                     <svg fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" width="48" height="48" className="mb-16 opacity-50 mx-auto block"><path d="M21 15.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM17.5 7L13 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                     <div className="font-bold text-16">No services found</div>
                     <div className="text-13 mt-4">Start by adding your first service description.</div>
                  </td></tr>
                )}
                {services.map((service, index) => (
                  <tr key={service.id || service._id}>
                    <td>{((meta.page || 1) - 1) * limit + index + 1}</td>
                    <td>
                      <div className="av av-xl rounded-10 shadow-sm bg-slate-100 overflow-hidden" style={{ width: '64px', height: '48px', backgroundImage: `url(${getImageUrl(service.image)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        {!service.image && <div className="w-full h-full flex items-center justify-center opacity-30"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>}
                      </div>
                    </td>
                    <td>
                      <div className="w-40 h-40 bg-blue-50 text-blue-600 rounded-10 flex items-center justify-center p-8 overflow-hidden border border-blue-100 shadow-sm transition-150 group-hover:scale-110">
                        {service.icon_svg ? <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: service.icon_svg }} /> : <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
                      </div>
                    </td>
                    <td>
                       <div className="font-black text-14 text-text tracking-wide">{service.title}</div>
                       <div className="text-11 text-muted font-bold font-mono mt-4 uppercase tracking-widest overflow-hidden truncate max-w-160">{service.slug}</div>
                    </td>
                    <td>
                      <button className={`badge border ${service.isActive ? 'bg-green-50 text-green-700 border-green-500 border-opacity-20' : 'bg-red-50 text-red-600 border-red-500 border-opacity-20'} font-bold px-12 py-6 cursor-pointer hover:shadow-sm transition-150`} onClick={() => handleToggleStatus(service.id, service.isActive)}>
                        <span className={`status-dot ${service.isActive ? 'dot-green' : 'dot-red'} mr-6`} />
                        {service.isActive ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="text-center">
                       <div className="flex justify-center gap-6">
                         <button className="btn btn-outline btn-icon" onClick={() => handleOpenModal(service)} title="Edit">
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                         </button>
                         <button className="btn btn-danger btn-icon" onClick={() => handleDelete(service.id)} title="Delete">
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

      {/* Premium Service Modal Wrapper */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidthClass="max-w-520"
        title={
          <div className="flex items-center gap-12">
             <span className="av av-sm text-white" style={{ background: 'var(--blue)' }}>
               <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             </span>
             <h2 className="text-16 font-black m-0 text-text tracking-wide uppercase">{formData.id ? 'Edit Service' : 'Configure New Service'}</h2>
          </div>
        }
        footer={
           <div className="flex gap-12 w-full justify-end">
              <button type="button" onClick={handleCloseModal} className="btn btn-outline font-bold px-20 border-1.5 border-border">Cancel Action</button>
              <button type="button" onClick={handleSubmit} disabled={saving} className="btn btn-primary font-bold px-24 py-10 shadow-sm rounded-20">
                 {saving ? 'Saving...' : formData.id ? 'Update Service' : 'Authorize Service'}
              </button>
           </div>
        }
      >
          <div id="serviceForm" className="flex flex-col gap-24">
              <div className="bg-slate-50 p-20 rounded-16 border border-border">
                  <div className="form-group mb-20">
                      <label className="text-11 uppercase text-muted tracking-widest font-black mb-6 block">Service Title *</label>
                      <input type="text" required value={formData.title} onChange={e => {
                          const val = e.target.value;
                          setFormData({...formData, title: val, slug: formData.id ? formData.slug : val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')});
                      }} className="form-input text-15 font-black bg-white shadow-sm border-transparent" placeholder="e.g. Luxury Wedding Cars" />
                  </div>
                  
                  <div className="form-group">
                      <label className="text-11 uppercase text-muted tracking-widest font-black mb-6 block">Slug (Search Engine Optimization)</label>
                      <div className="relative">
                        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-12">/</span>
                        <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="form-input text-12 font-mono bg-white shadow-sm border-transparent pl-20 uppercase tracking-widest" />
                      </div>
                  </div>
              </div>

              <div className="form-group">
                  <label className="text-11 uppercase text-muted tracking-widest font-black mb-12 block flex items-center gap-6">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Public Description Content
                  </label>
                  <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="form-input text-13 resize-none h-120 bg-slate-50 border-transparent shadow-sm p-16 leading-relaxed focus:bg-white" placeholder="Write a compelling description for this service..." />
              </div>

              <div className="flex flex-col gap-24 px-4 pb-12">
                  <div className="form-group">
                      <label className="text-11 uppercase text-muted tracking-widest font-black mb-10 block">Header Thumbnail (Image File)</label>
                      <div className="flex gap-20">
                         {/* Dashed Dropzone */}
                         <label className="flex-1 h-140 border-2 border-dashed border-slate-200 rounded-20 bg-slate-50 flex flex-col items-center justify-center gap-12 cursor-pointer transition-150 hover:bg-white hover:border-blue-400 group overflow-hidden relative">
                            {formData.image && (
                              <div className="absolute inset-0 bg-cover bg-center rounded-20 opacity-30 transition-150 group-hover:opacity-10" style={{ backgroundImage: `url(${getImageUrl(formData.image)})` }} />
                            )}
                            <div className="w-48 h-48 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 transition-150 group-hover:scale-110 relative z-10">
                               <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                            </div>
                            <span className="text-12 font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 relative z-10">
                               {uploading.main ? 'Uploading...' : formData.image ? 'Change Image' : 'Image File'}
                            </span>
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'main')} />
                         </label>
                      </div>
                  </div>

                  <div className="form-group mt-8">
                      <label className="text-11 uppercase text-muted tracking-widest font-black mb-10 block">SVG Icon (Branding File)</label>
                      <div className="flex gap-20">
                         {/* Dashed Dropzone */}
                         <label className="flex-1 h-140 border-2 border-dashed border-slate-200 rounded-20 bg-slate-50 flex flex-col items-center justify-center gap-12 cursor-pointer transition-150 hover:bg-white hover:border-blue-400 group overflow-hidden relative">
                            {formData.icon_svg && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-10 transition-150 group-hover:opacity-5">
                                 <div className="w-64 h-64 text-blue-900" dangerouslySetInnerHTML={{ __html: formData.icon_svg }} />
                              </div>
                            )}
                            <div className="w-48 h-48 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 transition-150 group-hover:scale-110 relative z-10">
                               <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                            </div>
                            <span className="text-12 font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 relative z-10">
                              {formData.icon_svg ? 'Change SVG Icon' : 'SVG Icon'}
                            </span>
                            <input type="file" style={{ display: 'none' }} accept=".svg" onChange={handleSvgUpload} />
                         </label>
                      </div>
                  </div>
              </div>
          </div>
      </Modal>
    </div>
  );
}
