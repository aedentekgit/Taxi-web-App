import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import { rolesAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const BLANK = { name: '', description: '', permissions: [] };

const PAGE_GROUPS = [
  { label: 'Main', opts: [
      {value:'dashboard', label:'Dashboard'}
    ] 
  },
  { label: 'Bookings', opts: [
      {value:'bookings', label:'Cab Bookings'}, 
      {value:'intercity', label:'Intercity'}, 
      {value:'rental', label:'Rental Rides'}
    ] 
  },
  { label: 'People', opts: [
      {value:'customers', label:'Customers'}, 
      {value:'drivers', label:'Drivers'}, 
      {value:'employees', label:'Employees'}
    ] 
  },
  { label: 'Operations', opts: [
      {value:'finance', label:'Finance'}, 
      {value:'support', label:'Support'}, 
      {value:'sos', label:'SOS Alerts'}
    ] 
  },
  { label: 'Growth', opts: [
      {value:'packages', label:'Tour Packages'},
      {value:'incentives', label:'Driver Incentives'},
      {value:'coupons', label:'Coupons'}
    ] 
  },
  { label: 'System', opts: [
      {value:'roles', label:'Roles'}, 
      {value:'settings', label:'Settings'}
    ] 
  }
];

const ALL_PAGES = PAGE_GROUPS.flatMap(g => g.opts);

export default function Roles() {
  const [roles, setRoles]       = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', search: '', page: 1 });
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetchRoles = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    rolesAPI.getAll(params)
      .then(r => {
        setRoles(r.data.data);
        if (r.data.page) {
           setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages });
        }
      })
      .catch(() => showToast('Failed to load roles', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  const openAdd  = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (r) => { setForm({ name: r.name, description: r.description || '', permissions: r.permissions || [] }); setModal({ type: 'edit', id: r._id }); };

  const handleSave = async () => {
    if (!form.name) return showToast('Role name required', 'error');
    setSaving(true);
    try {
      if (modal === 'add') await rolesAPI.create(form);
      else await rolesAPI.update(modal.id, form);
      showToast(`Role ${modal === 'add' ? 'created' : 'updated'}`, 'success');
      setModal(null);
      fetchRoles();
    } catch (e) { showToast(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this role?'))) return;
    try {
      await rolesAPI.remove(id);
      showToast('Role deleted', 'success');
      fetchRoles();
    } catch (e) { showToast(e.response?.data?.message || 'Delete failed', 'error'); }
  };

  const handleToggle = async (id, currentIsActive) => {
    try {
      await rolesAPI.toggleStatus(id);
      showToast(currentIsActive ? 'Role Disabled' : 'Role Enabled', currentIsActive ? 'error' : 'success');
      fetchRoles();
    } catch { showToast('Update failed', 'error'); }
  };

  const togglePermission = (val) => {
    setForm(f => {
      const perms = f.permissions || [];
      if (perms.includes(val)) return { ...f, permissions: perms.filter(p => p !== val) };
      return { ...f, permissions: [...perms, val] };
    });
  };

  const toggleAllPermissions = () => {
    const all = ALL_PAGES.map(p => p.value);
    const current = form.permissions || [];
    if (current.length === all.length) setForm(f => ({ ...f, permissions: [] }));
    else setForm(f => ({ ...f, permissions: all }));
  };

  return (
    <div>
      <ToastContainer />
      <PageHeader 
        title="Roles" 
        description="Configure staff roles and permission boundaries." 
        icon="🔑" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search role name..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', search: '', page: 1 })}>Reset</button>
      
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Role</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S NO</th>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Pages</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted p-40">No roles configured</td></tr>
                )}
                {roles.map((r, _index) => (
                  <tr key={r._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td>
                      <div className="font-semibold text-13">{r.name}</div>
                    </td>
                    <td className="text-12 text-sub">{r.description || '—'}</td>
                    <td>
                      <span className="font-semibold text-13">{(r.permissions || []).length}</span>
                    </td>
                    <td><StatusBadge status={r.isActive ? 'active' : 'inactive'} /></td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline text-12 btn-icon" onClick={() => openEdit(r)} title="Edit"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className={`btn ${r.isActive ? 'btn-danger' : 'btn-primary'} btn-icon`} onClick={() => handleToggle(r._id, r.isActive)}>
                          {r.isActive ? ( <span title="Disable"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span> ) : ( <span title="Enable"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></span> )}
                        </button>
                        <button className="btn btn-danger text-12 btn-icon" onClick={() => handleDelete(r._id)} title="Delete"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
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

      {/* Role Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Role' : 'Edit Role'}
        maxWidthClass="max-w-520"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary px-24" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Role'}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-16 shrink-0">
          <div className="form-group col-span-2 sm:col-span-1">
            <label>Role Name <span className="text-red-500">*</span></label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Area Manager" />
          </div>
          <div className="form-group col-span-2 sm:col-span-1">
            <label>Description</label>
            <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief role summary..." />
          </div>
        </div>

        <div className="form-group border-t border-light pt-16 mt-4 shrink-0">
          <div className="flex justify-between items-center mb-16">
            <label className="mb-0 text-14 font-bold text-text">Page Access Permissions</label>
            <button type="button" className="btn btn-outline btn-sm text-11" onClick={toggleAllPermissions} style={{ padding: '4px 10px', borderRadius: '4px' }}>
              {(form.permissions || []).length === ALL_PAGES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="flex flex-col gap-12 shrink-0">
            {PAGE_GROUPS.map(g => (
              <div key={g.label} className="bg-slate-50 p-14 rounded-8 border border-light">
                <div className="text-11 font-bold text-sub uppercase tracking-wider mb-10">{g.label}</div>
                <div className="flex flex-wrap gap-8">
                  {g.opts.map(po => {
                    const hasPerm = (form.permissions || []).includes(po.value);
                    return (
                      <div 
                        key={po.value} 
                        onClick={() => togglePermission(po.value)}
                        className={`flex items-center gap-6 px-10 py-6 rounded-8 cursor-pointer transition-150 border-1.5 ${hasPerm ? 'bg-orange text-white border-transparent' : 'bg-white text-sub border-light hover:border-orange'}`}
                        style={{ fontSize: '13px', fontWeight: hasPerm ? '600' : '500', userSelect: 'none' }}
                      >
                        {hasPerm ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <div style={{width:'14px', height:'14px', borderRadius:'4px', border:'1.5px solid #cbd5e1'}} />
                        )}
                        {po.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
