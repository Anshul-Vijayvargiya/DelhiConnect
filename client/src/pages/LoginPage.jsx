import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', phone: '' });
  const [mode, setMode] = useState('admin'); // admin | citizen
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const creds = mode === 'admin' ? { email: form.email, password: form.password } : { phone: form.phone, password: form.password };
    const res = await login(creds);
    if (res.success) {
      toast.success(`Welcome, ${res.user.name}!`);
      if (res.user.role === 'admin') navigate('/admin/overview');
      else if (res.user.role === 'officer') navigate('/officer/dashboard');
      else navigate('/my-complaints');
    } else {
      setError(res.message);
    }
  };

  // Demo credential filler
  const fillDemo = (role) => {
    if (role === 'admin') { setForm({ email: 'admin@delhi.gov.in', password: 'admin123', phone: '' }); setMode('admin'); }
    if (role === 'officer') { setForm({ email: 'officer.roads@delhi.gov.in', password: 'officer123', phone: '' }); setMode('admin'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3A6B] via-[#0f2548] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">DelhiConnect</h1>
          <p className="text-blue-300 text-sm mt-1">Chief Minister's Grievance Dashboard</p>
          <p className="text-blue-400 text-xs mt-1">Government of National Capital Territory of Delhi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Tab Switch */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button onClick={() => setMode('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'admin' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}>
              Officer / Admin
            </button>
            <button onClick={() => setMode('citizen')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'citizen' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}>
              Citizen
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="input" placeholder="officer@delhi.gov.in"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="tel" className="input" placeholder="+91XXXXXXXXXX"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" className="input" placeholder="Enter password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1A3A6B] hover:bg-[#0f2548] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo('admin')}
                className="py-2 px-3 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                🏛️ Admin Login
              </button>
              <button onClick={() => fillDemo('officer')}
                className="py-2 px-3 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                👮 Officer Login
              </button>
            </div>
            <div className="mt-3 text-center">
              <a href="/" className="text-xs text-blue-700 hover:underline">
                Submit complaint without login →
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">
          Helpline: 1076 | CM Helpline: 011-23392470
        </p>
      </div>
    </div>
  );
}
