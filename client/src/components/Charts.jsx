import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#1A3A6B', '#FF6B35', '#16A34A', '#D97706', '#7C3AED', '#0EA5E9', '#EC4899', '#14B8A6', '#F59E0B'];

export function TrendChart({ data = [], loading }) {
  if (loading) return <div className="h-64 bg-slate-50 animate-pulse rounded-lg" />;
  if (!data || data.length === 0) return (
    <div className="h-[260px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
      <span className="text-slate-400 text-sm font-medium">No complaint data available for this period.</span>
    </div>
  );

  const formatted = data.map(d => ({
    date: `${d._id?.day ?? ''}/${d._id?.month ?? d._id?.week ?? ''}`,
    Submitted: d.count,
    Resolved: d.resolved
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Submitted" stroke="#1A3A6B" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Resolved" stroke="#16A34A" strokeWidth={2} dot={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({ data = [], loading }) {
  if (loading) return <div className="h-64 bg-slate-50 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748B' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DeptPieChart({ data = [], loading }) {
  if (loading) return <div className="h-64 bg-slate-50 animate-pulse rounded-lg" />;
  const filtered = data.filter(d => d._id).slice(0, 7);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="total"
          nameKey="_id"
          label={({ _id, percent }) => `${(_id || 'Unknown').split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {filtered.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => [value, props.payload._id || 'Unknown']} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DepartmentTable({ data = [], loading }) {
  if (loading) return <div className="h-32 bg-slate-50 animate-pulse rounded-lg" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 text-slate-600 font-semibold">Department</th>
            <th className="text-right px-4 py-3 text-slate-600 font-semibold">Total</th>
            <th className="text-right px-4 py-3 text-slate-600 font-semibold">Resolved</th>
            <th className="text-right px-4 py-3 text-slate-600 font-semibold">Pending</th>
            <th className="px-4 py-3 text-slate-600 font-semibold">SLA Compliance</th>
          </tr>
        </thead>
        <tbody>
          {data.map((dept, i) => {
            const compliance = dept.total > 0
              ? (((dept.total - (dept.breached || 0)) / dept.total) * 100).toFixed(0)
              : 100;
            const complianceNum = Number(compliance);
            return (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{dept._id || 'Unassigned'}</td>
                <td className="px-4 py-3 text-right text-slate-700">{dept.total}</td>
                <td className="px-4 py-3 text-right text-green-700">{dept.resolved || 0}</td>
                <td className="px-4 py-3 text-right text-yellow-700">{dept.pending || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${complianceNum >= 80 ? 'bg-green-500' : complianceNum >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${complianceNum}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${complianceNum >= 80 ? 'text-green-700' : complianceNum >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                      {compliance}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
