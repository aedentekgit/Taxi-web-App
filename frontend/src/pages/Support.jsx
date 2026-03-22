import PageHeader from '../components/PageHeader.jsx';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import { supportAPI } from '../api/index.js';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const STATUSES   = ['', 'open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];

export default function Support() {
  const [tickets, setTickets]   = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', priority: '', search: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [reply, setReply]       = useState('');
  const [sending, setSending]   = useState(false);
  const { showToast, ToastContainer } = useToast();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    supportAPI.getAll(params)
      .then(r => { setTickets(r.data.data); setMeta({ total: r.data.total, page: r.data.page, limit: r.data.limit, pages: r.data.pages }); })
      .catch(() => showToast('Failed to load tickets', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const openTicket = async (id) => {
    try {
      const r = await supportAPI.getOne(id);
      setSelected(r.data.data);
      setReply('');
    } catch { showToast('Failed to load ticket', 'error'); }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await supportAPI.addReply(selected._id, { message: reply });
      showToast('Reply sent', 'success');
      const r = await supportAPI.getOne(selected._id);
      setSelected(r.data.data);
      setReply('');
    } catch { showToast('Failed to send reply', 'error'); }
    finally { setSending(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await supportAPI.updateStatus(id, { status });
      showToast('Status updated', 'success');
      if (selected?._id === id) {
        const r = await supportAPI.getOne(id);
        setSelected(r.data.data);
      }
      fetch();
    } catch { showToast('Update failed', 'error'); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const setPage   = (p)    => setFilters(f => ({ ...f, page: p }));

  return (
    <div>
      <ToastContainer />

      <PageHeader 
        title="Support" 
        description="Handle customer support tickets and vehicle issues." 
        icon="🎧" 
        statLabel="Total Tickets" 
        statValue={meta?.total || 0} statIcon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="22" height="22"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>} 
      />
      <div className="filter-bar">
        <SearchInput placeholder="Search ticket ID, subject..." value={filters.search} onChange={v => setFilter('search', v)} />
        <CustomSelect className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </CustomSelect>
        <CustomSelect className="filter-select" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priority'}</option>)}
        </CustomSelect>
        <button className="btn btn-outline" onClick={() => setFilters({ status: '', priority: '', search: '', page: 1 })}>Reset</button>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>S NO</th><th>Ticket ID</th><th>Subject</th><th>From</th><th>Type</th><th>Priority</th><th>Replies</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted p-40">No tickets found</td></tr>
                )}
                {tickets.map((t, _index) => (
                  <tr key={t._id}>
                    <td>{((meta?.page || 1) - 1) * 10 + _index + 1}</td>
                    <td><span className="font-bold text-orange text-12">{t.ticketId}</span></td>
                    <td className="max-w-200 overflow-hidden text-ellipsis whitespace-nowrap text-13">{t.subject}</td>
                    <td>
                      <div className="text-13">{t.customer?.name || t.driver?.name || '—'}</div>
                      <div className="text-11 text-muted capitalize">{t.raisedByType}</div>
                    </td>
                    <td className="capitalize text-12">{t.category}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td className="font-semibold">{t.replies?.length || 0}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-12 text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-outline text-11 px-8 py-3" onClick={() => openTicket(t._id)} title="View"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                        {t.status !== 'resolved' && t.status !== 'closed' && (
                          <button className="btn btn-primary text-11 px-8 py-3" onClick={() => handleStatus(t._id, 'resolved')} title="Resolve"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></button>
                        )}
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

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          <div className="flex justify-between items-center w-full mr-24">
            <div>
              <h3 className="mb-4">{selected?.subject}</h3>
              <div className="flex gap-8">
                <span className="text-12 text-muted">{selected?.ticketId}</span>
                {selected && <StatusBadge status={selected.status} />}
                {selected && <PriorityBadge priority={selected.priority} />}
              </div>
            </div>
            {selected && (
              <div className="flex gap-8 items-center">
                <CustomSelect className="filter-select text-11" value={selected.status}
                  onChange={e => handleStatus(selected._id, e.target.value)}>
                  {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </CustomSelect>
              </div>
            )}
          </div>
        }
        maxWidthClass="max-w-[580px]"
        footer={
          selected?.status !== 'closed' ? (
            <div className="w-full flex gap-10">
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Type your reply..." rows={2}
                className="flex-1 px-14 py-10 border-1.5 border-border rounded-8 text-13 resize-none font-inherit" />
              <button className="btn btn-primary self-end" onClick={handleReply} disabled={sending || !reply.trim()}>
                {sending ? '...' : 'Send'}
              </button>
            </div>
          ) : null
        }
      >
        {/* Original message */}
        <div className="bg-bg rounded-10 p-14 border-l-3 border-orange shrink-0">
          <div className="flex justify-between mb-6">
            <span className="font-semibold text-13">{selected?.customer?.name || selected?.driver?.name || 'User'}</span>
            {selected && <span className="text-11 text-muted">{new Date(selected.createdAt).toLocaleString()}</span>}
          </div>
          <p className="text-13 text-sub m-0">{selected?.message}</p>
        </div>

        {/* Replies */}
        {selected?.replies?.map((r, i) => (
          <div key={i} className={`rounded-10 p-14 border-l-3 max-w-[90%] w-full shrink-0 ${r.fromAdmin ? 'bg-green-50 border-green-500 self-end' : 'bg-bg border-border self-start'}`}>
            <div className="flex justify-between mb-6">
              <span className={`font-semibold text-13 ${r.fromAdmin ? 'text-green-600' : 'text-text'}`}>
                {r.fromAdmin ? 'Support Team' : (selected.customer?.name || selected.driver?.name || 'User')}
              </span>
              <span className="text-11 text-muted">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-13 text-sub m-0">{r.message}</p>
          </div>
        ))}
      </Modal>
    </div>
  );
}
