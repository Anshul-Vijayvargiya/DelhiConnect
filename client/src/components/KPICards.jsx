export default function KPICards({ data, loading }) {
  const cards = [
    {
      label: 'Total Complaints',
      value: data?.total ?? '—',
      icon: '📊',
      color: 'text-blue-900',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      label: 'Pending/Sub',
      value: data?.pending ?? '—',
      icon: '⏳',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    {
      label: 'In Progress',
      value: data?.inProgress ?? '—',
      icon: '🔧',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    {
      label: 'Resolved/Closed',
      value: data?.resolved ?? '—',
      icon: '✅',
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      label: 'Overdue (SLA Breached)',
      value: data?.slaBreached ?? '—',
      icon: '⚠️',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      label: 'Avg Resolution',
      value: data?.avgResolutionHours ? `${data.avgResolutionHours.toFixed(1)}h` : '—',
      icon: '⏱️',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      label: 'Citizen Satisfaction',
      value: data?.citizenSatisfactionRate !== undefined ? `${data.citizenSatisfactionRate.toFixed(1)}%` : '—',
      icon: '😊',
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-200'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-8 bg-slate-200 rounded mb-2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const resolutionRate = data?.total > 0
    ? ((data.resolved / data.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`card p-4 border ${card.border} ${card.bg} animate-fade-in`}>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span>{card.icon}</span>
              <span className="text-xs text-slate-500 font-medium">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution rate bar */}
      {data?.total > 0 && (
        <div className="card p-4 flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Resolution Rate</span>
          <div className="flex-1 bg-slate-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-green-500 transition-all duration-700"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
          <span className="text-sm font-bold text-green-700 whitespace-nowrap">{resolutionRate}%</span>
        </div>
      )}
    </div>
  );
}
