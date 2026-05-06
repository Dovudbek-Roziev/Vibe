import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { SocketProvider } from './context/SocketContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPosts from './pages/admin/Posts';
import AdminReports from './pages/admin/Reports';
import AdminFeedback from './pages/admin/Feedback';

import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/" replace /> : children;
};

export default function App() {
  const { initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="reels" element={<Reels />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:conversationId" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="posts/:id" element={<PostDetail />} />
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}