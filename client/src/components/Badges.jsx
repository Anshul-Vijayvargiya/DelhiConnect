import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[priority] || 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  );
}

export function SLABadge({ breached, deadline }) {
  if (!deadline) return null;
  if (breached || (deadline && new Date() > new Date(deadline))) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        ⚠ SLA Breached
      </span>
    );
  }
  return null;
}

export function AIBadge({ score, category }) {
  if (!score) return null;
  const confidence = Math.round(score * 100);
  const color = confidence >= 80 ? 'text-green-700 bg-green-50' : confidence >= 60 ? 'text-yellow-700 bg-yellow-50' : 'text-slate-600 bg-slate-50';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      🤖 AI: {category} ({confidence}%)
    </span>
  );
}
