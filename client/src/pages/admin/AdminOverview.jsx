import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import KPICards from '../../components/KPICards';
import { TrendChart, CategoryChart, DeptPieChart } from '../../components/Charts';
import { analyticsAPI } from '../../services/api';

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.overview(),
      analyticsAPI.trends({ period: 'daily', days: 30 }),
      analyticsAPI.categories()
    ]).then(([ov, tr, ct]) => {
      setOverview(ov.data);
      setTrends(tr.data);
      setCats(ct.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="CM Dashboard — Overview">
      <div className="space-y-6 animate-fade-in">
        <KPICards data={overview} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">📈 Daily Complaint Trend (30 days)</h2>
            <TrendChart data={trends} loading={loading} />
          </div>

          {/* Category */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">📊 Category Breakdown</h2>
            <CategoryChart data={cats} loading={loading} />
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/admin/complaints', label: 'All Complaints', icon: '📋', color: 'bg-blue-50 border-blue-200' },
            { href: '/admin/heatmap', label: 'Heatmap View', icon: '🗺️', color: 'bg-purple-50 border-purple-200' },
            { href: '/admin/analytics', label: 'Full Analytics', icon: '📈', color: 'bg-green-50 border-green-200' },
            { href: '/admin/reports', label: 'Generate Report', icon: '📄', color: 'bg-orange-50 border-orange-200' },
          ].map(link => (
            <a key={link.href} href={link.href}
              className={`card p-4 border ${link.color} hover:shadow-md transition-shadow text-center`}>
              <div className="text-3xl mb-2">{link.icon}</div>
              <div className="text-sm font-medium text-slate-700">{link.label}</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
