import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { employeesAPI, rolesAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const BLANK = { name: '', email: '', phone: '', password: '', role: '' };

const roleColors = [
  { bg: '#fee2e2', text: '#dc2626' }, { bg: '#dbeafe', text: '#1d4ed8' }, { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fef3c7', text: '#d97706' }, { bg: '#ede9fe', text: '#7c3aed' }, { bg: '#ffedd5', text: '#ea580c' },
  { bg: '#e0f2fe', text: '#0284c7' }, { bg: '#fce7f3', text: '#db2777' }
];

const getRoleColors = (roleName) => {
  if (!roleName) return { bg: '#f1f5f9', text: '#64748b' };
  if (roleName.toLowerCase() === 'superadmin') return { bg: '#ede9fe', text: '#7c3aed' };
  let hash = 0;
  for (let i = 0; i < roleName.length; i++) hash = roleName.charCodeAt(i) + ((hash << 5) - hash);
  return roleColors[Math.abs(hash) % roleColors.length];
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [meta, setMeta]           = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ role: '', search: '', page: 1 });
  const [modal, setModal]         = useState(null); // null | 'add' | 'edit'
  const [form, setForm]           = useState(BLANK);
  const [saving, setSaving]       = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { confirmDialog } = useConfirm();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    employeesAPI.getAll(params)
      .then(r => { setEmployees(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load employees', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  const fetchRoles = useCallback(() => {
    rolesAPI.getAll({ limit: 200 })
      .then(r => setRolesList(r.data.data))
      .catch(() => console.error('Failed to load roles list'));
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  useEffect(() => { fetch(); }, [fetch]);

  const openAdd  = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (e) => { setForm({ name: e.name, email: e.email, phone: e.phone || '', role: e.role, password: '' }); setModal({ type: 'edit', id: e._id }); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.role) return showToast('Fill required fields', 'error');
    if (modal === 'add' && !form.password) return showToast('Password required', 'error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return showToast('Please enter a valid email address', 'error');
    if (form.phone && form.phone.length < 10) return showToast('Please enter a valid phone number', 'error');
    setSaving(true);
    try {
      if (modal === 'add') {
        await employeesAPI.create(form);
        showToast('Employee created', 'success');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await employeesAPI.update(modal.id, payload);
        showToast('Employee updated', 'success');
      }
      setModal(null);
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this employee?'))) return;
    try {
      await employeesAPI.remove(id);
      showToast('Employee deleted', 'success');
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Delete failed', 'error'); }
  };

  const handleToggle = async (id, currentIsActive) => {
    try {
      await employeesAPI.toggleStatus(id);
      showToast(currentIsActive ? 'Employee Account Disabled' : 'Employee Account Enabled', currentIsActive ? 'error' : 'success');
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Update failed', 'error'); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Employees" 
        description="Manage staff roles and dashboard access." 
        icon="👔" 
        statLabel="Total Records" 
        statValue={meta?.total || 0} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search name, email..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.role} onChange={e => setFilter('role', e.target.value)}>
          <option value="">All Roles</option>
          {rolesList.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ role: '', search: '', page: 1 })}>Reset</button>
      
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Employee</button>
        </div>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>S NO</th><th>Profile</th><th>Employee</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted p-40">No employees found</td></tr>
                )}
                {employees.map((e, _index) => (
                  <tr key={e._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td>
                      <div className="flex justify-center">
                        <div className="av av-o av-md">{e.name?.[0]}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-13">{e.name}</div>
                    </td>
                    <td className="text-12 text-sub">{e.email}</td>
                    <td className="text-12">{e.phone || '—'}</td>
                    <td>
                      <span className="badge-sm font-bold capitalize" style={{ background: getRoleColors(e.role).bg, color: getRoleColors(e.role).text, padding: '3px 10px' }}>
                        {e.role}
                      </span>
                    </td>
                    <td><StatusBadge status={e.isActive ? 'active' : 'inactive'} /></td>
                    <td className="text-12 text-muted">{e.lastLogin ? new Date(e.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div className="flex gap-6">
                        {e.role !== 'superadmin' && <>
                          <button className="btn btn-outline btn-icon" onClick={() => openEdit(e)} title="Edit"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                          <button className={`btn ${e.isActive ? 'btn-danger' : 'btn-primary'} btn-icon`}
                            onClick={() => handleToggle(e._id, e.isActive)}>
                            {e.isActive ? ( <span title="Disable"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span> ) : ( <span title="Enable"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></span> )}
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(e._id)} title="Delete"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                        </>}
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

      {/* Add / Edit Modal */}
      {/* Add / Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Employee' : 'Edit Employee'}
        maxWidthClass="max-w-480"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : modal === 'add' ? 'Create Employee' : 'Save Changes'}
            </button>
          </>
        }
      >
        {[['Name *', 'name', 'text'], ['Email *', 'email', 'email'], ['Phone', 'phone', 'text'],
          ['Password' + (modal !== 'add' ? ' (leave blank to keep)' : ' *'), 'password', 'password']].map(([l, k, t]) => (
          <div key={k} className="form-group shrink-0">
            <label>{l}</label>
            {k === 'phone' ? (
              <PhoneInput
                country={'in'}
                value={form[k]}
                onChange={phone => setForm(f => ({ ...f, [k]: phone }))}
                inputProps={{ name: k }}
                containerStyle={{ width: '100%' }}
                inputStyle={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
              />
            ) : (
              <input type={t} className="form-input" placeholder={l.replace(' *', '')} value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            )}
          </div>
        ))}
        <div className="form-group shrink-0">
          <label>Role *</label>
          <CustomSelect className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="">Select a Role</option>
            {rolesList.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
          </CustomSelect>
        </div>
      </Modal>
    </div>
  );
}
