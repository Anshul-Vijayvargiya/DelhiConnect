import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NAV_ADMIN = [
  { href: '/admin/overview', labelKey: 'Overview', icon: '📊' },
  { href: '/admin/complaints', labelKey: 'All Complaints', icon: '📋' },
  { href: '/all-grievances', labelKey: 'All Grievances', icon: '👥' },
  { href: '/admin/heatmap', labelKey: 'Heatmap', icon: '🗺️' },
  { href: '/admin/analytics', labelKey: 'Analytics', icon: '📈' },
  { href: '/admin/reports', labelKey: 'Reports', icon: '📄' },
  { href: '/about-delhiconnect', labelKey: 'What is DelhiConnect?', icon: 'ℹ️' },
];

const NAV_OFFICER = [
  { href: '/officer/dashboard', labelKey: 'My Complaints', icon: '📋' },
  { href: '/all-grievances', labelKey: 'All Grievances', icon: '👥' },
  { href: '/about-delhiconnect', labelKey: 'What is DelhiConnect?', icon: 'ℹ️' },
];

const NAV_CITIZEN = [
  { href: '/', labelKey: 'Submit Complaint', icon: '📤' },
  { href: '/my-complaints', labelKey: 'My Complaints', icon: '📋' },
  { href: '/all-grievances', labelKey: 'All Grievances', icon: '👥' },
  { href: '/about-delhiconnect', labelKey: 'What is DelhiConnect?', icon: 'ℹ️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { t, i18n } = useTranslation();
  const nav = user?.role === 'admin' ? NAV_ADMIN : user?.role === 'officer' ? NAV_OFFICER : NAV_CITIZEN;
  const path = window.location.pathname;

  const roleLabel = { admin: `🏛️ ${t('CM Admin')}`, officer: `👮 ${t('Officer')}`, citizen: `👤 ${t('Citizen')}` };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <aside className={`bg-[#1A3A6B] text-white flex flex-col h-screen transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
      {/* Header */}
      <div className="p-4 border-b border-blue-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <div className="font-bold text-sm">{t('DelhiConnect')}</div>
            <div className="text-blue-300 text-xs">{t('CM Dashboard')}</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-blue-300 hover:text-white p-1 rounded transition-colors">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 bg-blue-900 border-b border-blue-800">
          <div className="text-xs text-blue-300">{roleLabel[user.role]}</div>
          <div className="text-sm font-semibold truncate">{user.name}</div>
          {user.department && <div className="text-xs text-blue-300 truncate">{user.department}</div>}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = path === item.href || path.startsWith(item.href + '/');
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
              <span className="text-lg leading-none">{item.icon}</span>
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-blue-800 flex flex-col gap-2">
        <button onClick={toggleLanguage}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-bold bg-white/10 text-blue-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
          <span>🌐</span>
          {!collapsed && (i18n.language === 'en' ? 'हिन्दी' : 'English')}
        </button>
        {user ? (
          <button onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <span>🚪</span>
            {!collapsed && t('Logout')}
          </button>
        ) : (
          <a href="/login"
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-lg">
            <span>🔐</span>
            {!collapsed && t('Login')}
          </a>
        )}
      </div>
    </aside>
  );
}
