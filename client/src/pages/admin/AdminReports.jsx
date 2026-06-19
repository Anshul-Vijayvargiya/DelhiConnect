import { useState } from 'react';
import Layout from '../../components/Layout';
import { reportsAPI } from '../../services/api';
import { downloadBlob } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const tid = toast.loading('Generating PDF report...');
    try {
      const res = await reportsAPI.generate(dateRange);
      downloadBlob(res.data, `delhi-cm-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
      toast.success('Report downloaded!', { id: tid });
    } catch (err) {
      toast.error('Failed to generate report', { id: tid });
    } finally {
      setGenerating(false);
    }
  };

  const presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This year', days: 365 },
  ];

  const applyPreset = (days) => {
    setDateRange({
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Layout title="Report Generator">
      <div className="max-w-2xl space-y-6">
        {/* Generator card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📄</div>
            <div>
              <h2 className="font-bold text-slate-800">PDF Report Generator</h2>
              <p className="text-sm text-slate-500">Generate comprehensive complaint reports for CM Office</p>
            </div>
          </div>

          {/* Presets */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-2">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button key={p.label} onClick={() => applyPreset(p.days)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
              <input type="date" className="input" value={dateRange.startDate}
                onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
              <input type="date" className="input" value={dateRange.endDate}
                onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))} />
            </div>
          </div>

          <button onClick={generate} disabled={generating}
            className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60">
            {generating ? '⏳ Generating PDF...' : '⬇️ Generate & Download PDF Report'}
          </button>
        </div>

        {/* Report contents card */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">📋 Report Contents</h3>
          <ul className="space-y-3">
            {[
              { icon: '🏛️', title: 'Executive Summary', desc: 'Total complaints, resolution rate, average resolution time' },
              { icon: '📊', title: 'Top 5 Categories', desc: 'Most frequent complaint types with counts' },
              { icon: '🏢', title: 'Department Performance', desc: 'Per-department totals, resolved, pending, and SLA compliance rate' },
              { icon: '⚠️', title: 'SLA Breach List', desc: 'All complaints that exceeded SLA deadline (up to 20)' },
              { icon: '📍', title: 'District-wise Count', desc: 'Complaint distribution across all 11 Delhi districts' },
            ].map(item => (
              <li key={item.title} className="flex gap-3">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-slate-400 text-center">
          Reports are generated server-side using PDFKit. Data is fetched in real-time from MongoDB.
        </div>
      </div>
    </Layout>
  );
}
