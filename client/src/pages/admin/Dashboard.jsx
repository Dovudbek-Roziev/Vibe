import { useEffect, useState } from 'react';
import { Users, FileText, Flag, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 flex items-center gap-4 border border-gray-100 dark:border-gray-800">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8} /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Foydalanuvchilar" value={stats?.totalUsers} color="bg-blue-500" />
        <StatCard icon={FileText} label="Postlar" value={stats?.totalPosts} color="bg-purple-500" />
        <StatCard icon={Flag} label="Shikoyatlar" value={stats?.totalReports} color="bg-red-500" />
        <StatCard icon={TrendingUp} label="Bugun yangi" value={stats?.newUsersToday} color="bg-green-500" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <h2 className="font-bold mb-4">Haftalik statistika</h2>
        <div className="space-y-3">
          {stats?.weeklyStats?.map((w, i) => {
            const max = Math.max(...(stats.weeklyStats.map(x => x.posts)), 1);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{w.date}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${Math.min((w.posts / max) * 100, 100)}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{w.posts}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}