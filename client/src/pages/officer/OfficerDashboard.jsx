import { useEffect, useState } from 'react';
import { complaintsAPI } from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import StatusTimeline from '../../components/StatusTimeline';
import toast from 'react-hot-toast';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetch = () => {
    complaintsAPI.list({ limit: 100 })
      .then(r => setComplaints(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return;

    if (statusForm.status === 'Resolved') {
      if (!resolutionPhoto) {
        toast.error('Resolution photo required');
        return;
      }
      setUpdating(true);
      try {
        const fd = new FormData();
        fd.append('proof', resolutionPhoto);
        fd.append('resolutionNotes', statusForm.notes);
        await complaintsAPI.resolve(selected._id, fd);
        toast.success('Complaint marked as Resolved with photo proof!');
        setResolutionPhoto(null);
        setLoading(true);
        fetch();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to resolve');
      } finally {
        setUpdating(false);
      }
      return;
    }

    setUpdating(true);
    try {
      await complaintsAPI.updateStatus(selected._id, statusForm);
      toast.success('Status updated!');
      setSelected(null);
      setLoading(true);
      fetch();
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const isOverdue = (c) => c.slaDeadline && new Date() > new Date(c.slaDeadline) && !['Resolved', 'Closed', 'Rejected'].includes(c.status);

  return (
    <Layout title={`Officer Dashboard — ${user?.name}`}>
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Assigned', value: complaints.length, color: 'text-blue-900' },
            { label: 'Pending/Submitted', value: complaints.filter(c => c.status === 'Pending' || c.status === 'Submitted' || c.status === 'Reopened').length, color: 'text-yellow-700' },
            { label: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length, color: 'text-orange-700' },
            { label: 'Resolved/Closed', value: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length, color: 'text-green-700' },
            { label: 'Overdue (SLA Breached)', value: complaints.filter(c => isOverdue(c)).length, color: 'text-red-700' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700">Assigned Complaints</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-600">Complaint</th>
                  <th className="text-left px-4 py-3 text-slate-600">District</th>
                  <th className="text-left px-4 py-3 text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 text-slate-600">Priority</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : complaints.map(c => {
                  const overdue = isOverdue(c);
                  return (
                    <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.title}</span>
                          {overdue && (
                            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">Overdue</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{c.grievanceId || `#${String(c._id).slice(-5).toUpperCase()}`}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.district}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setSelected(c); setStatusForm({ status: c.status, notes: '' }); setResolutionPhoto(null); }}
                          className="text-xs text-blue-700 hover:underline font-medium">
                          Update →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update Status Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-slate-800">Update Complaint Status</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                <p className="font-semibold text-sm">{selected.title}</p>
                <p className="text-xs text-slate-500 mt-1">{selected.district} · {selected.address}</p>
                <div className="flex gap-2 mt-2">
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                  <select className="input" value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))} required>
                    <option value="">Select status</option>
                    {['Assigned', 'In Progress', 'Resolved', 'Rejected'].map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>

                {statusForm.status === 'Resolved' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Resolution Photo Proof <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setResolutionPhoto(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    {!resolutionPhoto && (
                      <p className="text-red-500 text-xs mt-1">Resolution photo required</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea className="input" rows={3} placeholder="Add update notes..."
                    value={statusForm.notes} onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={updating} className="flex-1 btn-primary justify-center">
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                  <button type="button" onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
                </div>
              </form>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Status History</h4>
                <StatusTimeline history={selected.statusHistory || []} currentStatus={selected.status} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
