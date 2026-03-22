import re

with open('frontend/src/pages/Drivers.jsx', 'r') as f:
    content = f.read()

# Replace the entire Modal rendering block
modal_pattern = re.compile(r'<Modal.*?</Modal>', re.DOTALL)

new_modal = '''<Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setIsEditing(false); }}
        title={selected === 'add' ? 'Add Driver' : isEditing ? 'Edit Driver' : 'Driver Profile'}
        maxWidthClass="max-w-640"
        footer={isEditing ? (
          <>
            <button className="btn btn-outline" onClick={() => { if (selected === 'add') setSelected(null); else setIsEditing(false); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>
              {saving ? 'Saving...' : selected === 'add' ? 'Create Driver' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => { setEditForm({ ...selected }); setIsEditing(true); }}>Edit Profile</button>
        )}
      >
        <div style={{ padding: '4px' }}>
          {isEditing ? (
            <div>
               <div className="grid-2 mb-20">
                 <div className="form-group col-span-full">
                   <label>Full Name *</label>
                   <input className="form-input" placeholder="e.g. John Doe" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                 </div>
                 <div className="form-group">
                   <label>Phone Number *</label>
                   <input className="form-input" placeholder="10-digit mobile" value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                 </div>
                 <div className="form-group">
                   <label>Email Address</label>
                   <input type="email" className="form-input" placeholder="john@example.com" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                 </div>
               </div>

               <h4 className="font-semibold text-12 text-sub uppercase tracking-widest mb-16 border-b pb-8">Vehicle Details</h4>
               <div className="grid-3">
                 <div className="form-group">
                   <label>Type</label>
                   <CustomSelect className="form-input capitalize" value={editForm.vehicleType || ''} onChange={e => setEditForm(f => ({ ...f, vehicleType: e.target.value }))}>
                     {['sedan','suv','auto','bike'].map(v => <option key={v} value={v}>{v}</option>)}
                   </CustomSelect>
                 </div>
                 <div className="form-group">
                   <label>Model</label>
                   <input className="form-input" placeholder="e.g. Swift Dzire" value={editForm.vehicleModel || ''} onChange={e => setEditForm(f => ({ ...f, vehicleModel: e.target.value }))} />
                 </div>
                 <div className="form-group">
                   <label>Vehicle No. *</label>
                   <input className="form-input uppercase" placeholder="TN 01 AB 1234" value={editForm.vehicleNumber || ''} onChange={e => setEditForm(f => ({ ...f, vehicleNumber: e.target.value }))} />
                 </div>
               </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-20 mb-32">
                <div className="av av-o" style={{ width: '64px', height: '64px', fontSize: '28px' }}>
                  {selected?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-12 mb-4">
                    <h2 className="text-24 font-bold text-text m-0">{selected?.name}</h2>
                    <StatusBadge status={selected?.status} />
                  </div>
                  <div className="flex gap-16 text-sub text-13 mt-8">
                    <span className="flex items-center gap-6">📱 {selected?.phone}</span>
                    <span className="flex items-center gap-6">✉️ {selected?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="grid-4 mb-32">
                 {[
                   { label: 'Total Rides', val: selected?.totalRides || 0 },
                   { label: 'Rating', val: selected?.avgRating ? `${Number(selected.avgRating).toFixed(1)} ⭐` : 'New' },
                   { label: 'Balance', val: `₹${selected?.walletBalance || 0}` },
                   { label: 'Verified', val: selected?.status === 'approved' ? 'Yes' : 'No' }
                 ].map(s => (
                   <div key={s.label} className="kpi-card" style={{ padding: '16px', borderRadius: '12px' }}>
                      <div className="kpi-label">{s.label}</div>
                      <div className="kpi-value text-18 mt-8">{s.val}</div>
                   </div>
                 ))}
              </div>

              <h4 className="font-semibold text-12 text-sub uppercase tracking-widest mb-16 border-b pb-8">Vehicle Information</h4>
              <div className="kpi-card bg-slate-50 shadow-none border border-light" style={{ padding: '20px', borderRadius: '12px' }}>
                <div className="grid-3">
                  <div>
                    <div className="text-11 text-sub mb-4">Type</div>
                    <div className="font-bold text-14 capitalize text-text">{selected?.vehicleType || 'Any'}</div>
                  </div>
                  <div>
                    <div className="text-11 text-sub mb-4">Model</div>
                    <div className="font-bold text-14 text-text">{selected?.vehicleModel || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-11 text-sub mb-4">Registration No.</div>
                    <div className="font-bold text-14 uppercase text-text">{selected?.vehicleNumber || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>'''

new_content = modal_pattern.sub(new_modal, content)

with open('frontend/src/pages/Drivers.jsx', 'w') as f:
    f.write(new_content)

