import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, Search, Film, MessageCircle, User } from 'lucide-react';

export default function MobileNav() {
  const { user } = useAuthStore();

  const items = [
    { to: '/', icon: Home },
    { to: '/explore', icon: Search },
    { to: '/reels', icon: Film },
    { to: '/chat', icon: MessageCircle },
    { to: `/profile/${user?.username}`, icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4 glass rounded-2xl shadow-2xl shadow-black/12 dark:shadow-black/70 pb-safe">
        <div className="flex items-center justify-around h-[60px] px-2">
          {items.map(({ to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105'
                    : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`
              }
            >
              <Icon size={21} strokeWidth={1.9} />
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}