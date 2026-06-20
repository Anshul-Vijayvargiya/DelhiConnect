import { useEffect, useState } from 'react';
import { complaintsAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { formatDate, timeAgo } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsAPI.list({ limit: 50 })
      .then(r => setComplaints(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="My Complaints">
      <div className="max-w-3xl space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="font-semibold text-slate-700">No complaints yet</h3>
            <a href="/" className="mt-4 inline-block btn-primary">Submit First Complaint</a>
          </div>
        ) : complaints.map(c => (
          <div key={c._id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">#{String(c._id).slice(-6).toUpperCase()} · {timeAgo(c.createdAt)}</p>
                <p className="text-sm text-slate-500 mt-1">{c.district} {c.ward && `· ${c.ward}`}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">{c.assignedDepartment || 'Not assigned'}</span>
              <a href={`/track/${c.grievanceId || `GR-${String(c._id).slice(-5).toUpperCase()}`}`} className="text-sm text-blue-700 hover:underline font-medium">
                Track →
              </a>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
