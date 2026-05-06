import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import RightPanel from './RightPanel';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-6xl mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 xl:w-72 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 px-4 py-6">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen border-r border-gray-200 dark:border-gray-800">
          <Outlet />
        </main>

        {/* Right panel — desktop only */}
        <aside className="hidden xl:block w-80 h-screen sticky top-0 px-6 py-6">
          <RightPanel />
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden h-24" />
      <MobileNav />
    </div>
  );
}