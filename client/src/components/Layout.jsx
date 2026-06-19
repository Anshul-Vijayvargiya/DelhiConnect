import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {user && <Sidebar />}
      <main className={`flex-1 overflow-y-auto flex flex-col ${!user ? 'min-h-screen' : ''}`}>
        {title && (
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">● Live</span>
            </div>
          </header>
        )}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '14px', borderRadius: '8px', maxWidth: '380px' },
        success: { iconTheme: { primary: '#16A34A', secondary: 'white' } },
        error: { iconTheme: { primary: '#DC2626', secondary: 'white' } }
      }} />
    </div>
  );
}
