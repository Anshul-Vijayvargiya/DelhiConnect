import { useState, useMemo } from 'react';
import { StatusBadge, PriorityBadge, SLABadge } from './Badges';
import { formatDate, timeAgo } from '../utils/helpers';
import { DELHI_DISTRICTS, CATEGORIES, STATUS_OPTIONS, PRIORITY_OPTIONS, DEPARTMENTS } from '../utils/constants';

export default function ComplaintTable({
  complaints = [],
  loading,
  onAssign,
  onStatusChange,
  showActions = false,
  total,
  page,
  pages,
  onPageChange
}) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === complaints.length ? [] : complaints.map(c => c._id));

  if (loading) {
    return (
      <div className="card">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-slate-100 animate-pulse">
            <div className="h-4 bg-slate-200 rounded flex-1" />
            <div className="h-4 bg-slate-100 rounded w-20" />
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Bulk actions bar */}
      {selectedIds.length > 0 && showActions && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} selected</span>
          <button onClick={() => onAssign?.(selectedIds)} className="text-xs btn-primary py-1">
            Bulk Assign
          </button>
          <button onClick={() => setSelectedIds([])} className="text-xs text-slate-500 hover:text-slate-700 ml-auto">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {showActions && (
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={selectedIds.length === complaints.length && complaints.length > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
              )}
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Complaint</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">District</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Priority</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Department</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Filed</th>
              {showActions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  No complaints found
                </td>
              </tr>
            ) : complaints.map((c) => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {showActions && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(c._id)}
                      onChange={() => toggleSelect(c._id)} className="rounded" />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 truncate max-w-xs">{c.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">#{String(c._id).slice(-6).toUpperCase()}</div>
                  {(c.slaBreached || (c.status !== 'Resolved' && c.slaDeadline && new Date() > new Date(c.slaDeadline))) && (
                    <SLABadge breached={true} deadline={c.slaDeadline} />
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.district}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">{c.assignedDepartment || '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{timeAgo(c.createdAt)}</td>
                {showActions && (
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/complaints/${c._id}`}
                      className="text-xs text-blue-700 hover:underline font-medium">View →</a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-500">
            Showing {complaints.length} of {total} complaints
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="px-3 py-1 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-white"
            >
              ← Prev
            </button>
            {[...Array(Math.min(pages, 7))].map((_, i) => (
              <button key={i}
                onClick={() => onPageChange?.(i + 1)}
                className={`px-3 py-1 text-sm rounded border ${page === i + 1 ? 'bg-blue-900 text-white border-blue-900' : 'border-slate-200 hover:bg-white'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page >= pages}
              onClick={() => onPageChange?.(page + 1)}
              className="px-3 py-1 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-white"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
