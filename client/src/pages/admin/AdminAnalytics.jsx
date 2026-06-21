import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { TrendChart, CategoryChart, DeptPieChart, DepartmentTable } from '../../components/Charts';
import { analyticsAPI } from '../../services/api';

export default function AdminAnalytics() {
  const [trends, setTrends] = useState([]);
  const [cats, setCats] = useState([]);
  const [depts, setDepts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    Promise.all([
      analyticsAPI.trends({ period, days: period === 'daily' ? 30 : 90 }),
      analyticsAPI.categories(),
      analyticsAPI.departments(),
      analyticsAPI.districts()
    ]).then(([tr, ct, dp, di]) => {
      setTrends(tr.data);
      setCats(ct.data);
      setDepts(dp.data);
      setDistricts(di.data);
    }).finally(() => setLoading(false));
  }, [period]);

  return (
    <Layout title="Analytics Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">📈 Complaint Volume Trend</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => { setPeriod(p); setLoading(true); }}
                  className={`px-3 py-1 text-xs rounded font-medium capitalize transition-all
                    ${period === p ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <TrendChart data={trends} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">📊 Category Breakdown</h2>
            <CategoryChart data={cats} loading={loading} />
            <div className="mt-4 space-y-1">
              {cats.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-600">{c._id}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-900 h-1.5 rounded-full"
                        style={{ width: `${cats[0]?.count ? (c.count / cats[0].count) * 100 : 0}%` }} />
                    </div>
                    <span className="font-semibold text-slate-700 w-8 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dept Distribution */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">🏢 Department Distribution</h2>
            <DeptPieChart data={depts} loading={loading} />
          </div>
        </div>

        {/* Department Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700">🏢 Department Performance</h2>
          </div>
          <DepartmentTable data={depts} loading={loading} />
        </div>

        {/* District Stats */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4">📍 District-wise Complaint Count</h2>
          <div className="space-y-2">
            {districts.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-44 truncate">{d._id || 'Unknown'}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-900 h-2 rounded-full transition-all"
                    style={{ width: `${districts[0]?.count ? (d.count / districts[0].count) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-700 w-10 text-right">{d.count}</span>
                <span className="text-xs text-green-700 w-12 text-right">{d.resolved || 0} ✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
