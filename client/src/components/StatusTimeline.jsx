import { formatDateTime } from '../utils/helpers';
import { StatusBadge } from './Badges';



const stepIcons = {
  Pending: '📥',
  Assigned: '📋',
  'In Progress': '🔧',
  Resolved: '✅',
  Rejected: '❌'
};

export default function StatusTimeline({ history = [], currentStatus }) {
  if (!history.length) return null;

  const isRejected = currentStatus === 'Rejected';

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const isLast = i === history.length - 1;
        return (
          <div key={i} className="flex gap-4 relative">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-slate-200 z-0" />
            )}
            {/* Icon */}
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg
              ${isLast && !isRejected ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-100 text-slate-500'}
              ${isLast && isRejected ? 'bg-red-100 text-red-700' : ''}`}>
              {stepIcons[entry.status] || '•'}
            </div>
            {/* Content */}
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={entry.status} />
                {entry.changedByName && (
                  <span className="text-xs text-slate-500">by {entry.changedByName}</span>
                )}
              </div>
              {entry.notes && (
                <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{formatDateTime(entry.changedAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
