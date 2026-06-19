import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import ComplaintTable from '../../components/ComplaintTable';
import { complaintsAPI } from '../../services/api';
import { DELHI_DISTRICTS, CATEGORIES, STATUS_OPTIONS, PRIORITY_OPTIONS, DEPARTMENTS } from '../../utils/constants';
import { StatusBadge, PriorityBadge, SLABadge, AIBadge } from '../../components/Badges';
import StatusTimeline from '../../components/StatusTimeline';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminComplaints() {
  const [data, setData] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', district: '', category: '', priority: '', search: '', page: 1 });
  const [detail, setDetail] = useState(null);
  const [assignForm, setAssignForm] = useState({ assignedDepartment: '', assignedOfficerId: '' });
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const fetch = useCallback(() => {
    setLoading(true);
    complaintsAPI.list({ ...filters, limit: 20 })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const openDetail = (id) => {
    complaintsAPI.get(id).then(r => {
      setDetail(r.data);
      setAssignForm({ assignedDepartment: r.data.assignedDepartment || '', assignedOfficerId: '' });
      setStatusForm({ status: r.data.status, notes: '' });
    });
  };

  const handleAssign = async () => {
    setSaving(true);
    try {
      await complaintsAPI.assign(detail._id, assignForm);
      toast.success('Complaint assigned!');
      setDetail(null);
      fetch();
    } catch { toast.error('Failed to assign'); }
    finally { setSaving(false); }
  };

  const handleStatus = async () => {
    setSaving(true);
    try {
      await complaintsAPI.updateStatus(detail._id, statusForm);
      toast.success('Status updated!');
      setDetail(null);
      fetch();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <Layout title="All Complaints">
      <div className="space-y-4">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select className="input w-36" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">District</label>
              <select className="input w-40" value={filters.district} onChange={e => setFilter('district', e.target.value)}>
                <option value="">All Districts</option>
                {DELHI_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select className="input w-36" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
              <select className="input w-32" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
                <option value="">All</option>
                {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
              <input className="input" placeholder="Search complaints..." value={filters.search}
                onChange={e => setFilter('search', e.target.value)} />
            </div>
            <button onClick={() => setFilters({ status: '', district: '', category: '', priority: '', search: '', page: 1 })}
              className="btn-secondary text-sm">Reset</button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Complaint</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">District</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Priority</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Department</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Filed</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : data.data.map(c => (
                  <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => openDetail(c._id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 truncate max-w-xs flex items-center gap-2">
                        {c.title}
                        {c.isHotspot && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full border border-orange-200 whitespace-nowrap">
                            🔥 Hotspot
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.grievanceId || `#${String(c._id).slice(-5).toUpperCase()}`}</div>
                      {(c.slaBreached || (c.slaDeadline && new Date() > new Date(c.slaDeadline) && !['Resolved', 'Closed', 'Rejected'].includes(c.status))) && (
                        <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 inline-block">Overdue</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.district}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[150px]">{c.assignedDepartment || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-blue-700 font-medium">View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <span className="text-sm text-slate-500">Showing {data.data.length} of {data.total}</span>
              <div className="flex gap-1">
                <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="px-3 py-1 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-white">← Prev</button>
                <span className="px-3 py-1 text-sm text-slate-600">Page {filters.page} of {data.pages}</span>
                <button disabled={filters.page >= data.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="px-3 py-1 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-white">Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {detail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{detail.title}</h3>
                  <p className="text-xs text-slate-400">#{String(detail._id).slice(-6).toUpperCase()} · {detail.district}</p>
                </div>
                <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">✕</button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={detail.status} />
                <PriorityBadge priority={detail.priority} />
                <SLABadge breached={detail.slaBreached} deadline={detail.slaDeadline} />
                <AIBadge score={detail.aiConfidenceScore} category={detail.aiCategory} />
                {detail.isHotspot && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">
                    🔥 Hotspot Ticket
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm mb-4">{detail.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-slate-400 text-xs">Category</span><p className="font-medium">{detail.category}</p></div>
                <div><span className="text-slate-400 text-xs">Citizen</span><p className="font-medium">{detail.citizenName || detail.citizenId?.name || '—'}</p></div>
                <div><span className="text-slate-400 text-xs">Phone</span><p className="font-medium">{detail.citizenPhone || '—'}</p></div>
                <div><span className="text-slate-400 text-xs">Address</span><p className="font-medium">{detail.address || '—'}</p></div>
              </div>

              {/* Linked Reporters Gallery */}
              {detail.isHotspot && detail.linkedReporters?.length > 0 && (
                <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                      🔥 Merged Hotspot Ticket
                    </h4>
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                      {detail.reporterCount} Reporters
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mb-4">This ticket is a hotspot merging multiple similar complaints in the area.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {detail.linkedReporters.map((reporter, idx) => (
                      <div key={idx} className="bg-white border border-orange-100 rounded-lg p-3 flex gap-3 shadow-sm hover:shadow transition-shadow">
                        {reporter.photo ? (
                          <img src={reporter.photo} alt="Issue" className="w-16 h-16 object-cover rounded-md border border-slate-100 flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-xl text-slate-300">📷</span>
                          </div>
                        )}
                        <div className="flex flex-col justify-center overflow-hidden">
                          <p className="text-sm font-semibold text-slate-800 truncate">{reporter.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{reporter.grievanceId}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(reporter.submittedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign */}
              <div className="border border-slate-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Assign Department</h4>
                <div className="flex gap-2">
                  <select className="input flex-1" value={assignForm.assignedDepartment}
                    onChange={e => setAssignForm(f => ({ ...f, assignedDepartment: e.target.value }))}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <button onClick={handleAssign} disabled={saving || !assignForm.assignedDepartment}
                    className="btn-primary text-sm whitespace-nowrap">
                    {saving ? '...' : 'Assign'}
                  </button>
                </div>
              </div>

              {/* Status Update */}
              <div className="border border-slate-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Update Status</h4>
                <div className="flex gap-2">
                  <select className="input flex-1" value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                    {['Submitted', 'Assigned', 'In Progress', 'Reopened', 'Rejected'].map(s =>
                      <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={handleStatus} disabled={saving}
                    className="btn-success text-sm whitespace-nowrap">
                    {saving ? '...' : 'Update'}
                  </button>
                </div>
                <input className="input mt-2 text-sm" placeholder="Optional notes"
                  value={statusForm.notes} onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Status Timeline</h4>
                <StatusTimeline history={detail.statusHistory || []} currentStatus={detail.status} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
