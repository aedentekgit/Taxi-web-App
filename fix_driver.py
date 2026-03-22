import re

with open('frontend/src/pages/Drivers.jsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("import CustomSelect from '../components/CustomSelect.jsx';", "import CustomSelect from '../components/CustomSelect.jsx';\nimport { useConfirm } from '../context/ConfirmContext.jsx';")

# 2. Hooks
content = content.replace("const { showToast, ToastContainer } = useToast();", "const { showToast, ToastContainer } = useToast();\n  const { confirmDialog } = useConfirm();")

# 3. Add Driver filtering bar
content = content.replace('''        <button className="btn btn-outline" onClick={() => setFilters({ search: '', page: 1 })}>
          Clear Filters
        </button>
      </div>''', '''        <button className="btn btn-outline" onClick={() => setFilters({ search: '', page: 1 })}>
          Clear Filters
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={() => { setSelected('add'); setIsEditing(true); setEditForm({ name: '', phone: '', email: '', vehicleType: 'sedan', vehicleModel: '', vehicleNumber: '' }); }}>+ Add Driver</button>
        </div>
      </div>''')

# 4. handleEditSave and handleDelete
old_edit_save = '''  const handleEditSave = async () => {
    if (editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) return showToast('Please enter a valid email address', 'error');
    }
    if (!editForm.name || !editForm.phone) return showToast('Name and phone are required', 'error');
    if (editForm.phone && editForm.phone.length < 10) return showToast('Please enter a valid phone number', 'error');
    setSaving(true);
    try {
      await driversAPI.update(selected._id, editForm);
      showToast('Driver updated successfully', 'success');
      setSelected({ ...selected, ...editForm });
      setIsEditing(false);
      fetch();
    } catch (e) {
      showToast(e.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };'''

new_edit_save = '''  const handleEditSave = async () => {
    if (editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) return showToast('Please enter a valid email address', 'error');
    }
    if (!editForm.name || !editForm.phone) return showToast('Name and phone are required', 'error');
    if (!editForm.vehicleNumber) return showToast('Vehicle number is required', 'error');
    if (editForm.phone && editForm.phone.length < 10) return showToast('Please enter a valid phone number', 'error');
    setSaving(true);
    try {
      if (selected === 'add') {
        await driversAPI.create({ ...editForm, status: 'approved' });
        showToast('Driver created successfully', 'success');
      } else {
        await driversAPI.update(selected._id, editForm);
        showToast('Driver updated successfully', 'success');
        setSelected({ ...selected, ...editForm });
      }
      setSelected(null);
      setIsEditing(false);
      fetch();
    } catch (e) {
      showToast(e.response?.data?.message || (selected === 'add' ? 'Creation failed' : 'Update failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Delete this driver?'))) return;
    try {
      await driversAPI.remove(id);
      showToast('Driver deleted', 'success');
      fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Delete failed', 'error'); }
  };'''

content = content.replace(old_edit_save, new_edit_save)


# 5. Table body action buttons replaced entirely using regex to find the `<td>` block

td_actions_pattern = re.compile(r'<td>\s*<div className="flex gap-6">\s*<button.*?</div>\s*</td>', re.DOTALL)

new_actions = '''<td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline btn-icon" onClick={() => setSelected(d)} title="View"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                        <button className="btn btn-outline btn-icon" onClick={() => { setSelected(d); setEditForm({...d}); setIsEditing(true); }} title="Edit"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        
                        {d.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-icon" disabled={actioning === d._id} title="Approve"
                              onClick={() => doAction(driversAPI.approve, d._id, 'approved')}><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg></button>
                            <button className="btn btn-danger btn-icon" disabled={actioning === d._id} title="Reject"
                              onClick={() => doAction(driversAPI.reject, d._id, 'rejected')}><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                          </>
                        )}
                        
                        {d.status !== 'pending' && d.status !== 'rejected' && (
                          <button className={`btn ${d.status === 'blocked' ? 'btn-success' : 'btn-danger'} btn-icon`} disabled={actioning === d._id}
                            onClick={() => doAction(driversAPI.toggleBlock, d._id, d.status === 'blocked' ? 'unblocked' : 'blocked')} title={d.status === 'blocked' ? 'Unblock' : 'Block'}>
                            {d.status === 'blocked' ? ( <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg> ) : ( <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> )}
                          </button>
                        )}

                        <button className="btn btn-danger btn-icon" disabled={actioning === d._id} onClick={() => handleDelete(d._id)} title="Delete"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                      </div>
                    </td>'''

content = td_actions_pattern.sub(new_actions, content)

# 6. Change vehiclePlate to vehicleNumber
content = content.replace("vehiclePlate", "vehicleNumber")


# 7. Modal rendering
old_modal = '''<span className="font-black text-18 uppercase tracking-widest">{isEditing ? 'Modify Driver Record' : 'Driver Insights'}</span>
            {!isEditing && ('''

new_modal = '''<span className="font-black text-18 uppercase tracking-widest">{selected === 'add' ? 'Add Driver' : isEditing ? 'Modify Driver Record' : 'Driver Insights'}</span>
            {!isEditing && selected !== 'add' && ('''

content = content.replace(old_modal, new_modal)

with open('frontend/src/pages/Drivers.jsx', 'w') as f:
    f.write(content)
