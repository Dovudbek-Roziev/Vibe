import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, FileText, Flag, MessageSquareWarning, LogOut, ArrowLeft } from 'lucide-react';

const AdminNavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === '/admin'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
       ${isActive ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`
    }
  >
    <Icon size={20} />
    {label}
  </NavLink>
);

export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex text-black dark:text-white">
      {/* Admin Sidebar */}
      <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col px-4 py-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Vibe Admin</h1>
          <p className="text-xs text-gray-500 mt-1">{t('adminPanel')}</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <AdminNavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
          <AdminNavItem to="/admin/users" icon={Users} label={t('totalUsers')} />
          <AdminNavItem to="/admin/posts" icon={FileText} label={t('totalPosts')} />
          <AdminNavItem to="/admin/reports" icon={Flag} label={t('reports')} />
          <AdminNavItem to="/admin/feedback" icon={MessageSquareWarning} label={t('allFeedbacks')} />
        </nav>

        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
          >
            <ArrowLeft size={20} /> Saytga qaytish
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
          >
            <LogOut size={20} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}