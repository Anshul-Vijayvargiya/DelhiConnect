import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TrackComplaintPage from './pages/TrackComplaintPage';
import MyComplaintsPage from './pages/citizen/MyComplaintsPage';
import AllGrievancesPage from './pages/citizen/AllGrievancesPage';
import AboutDelhiConnectPage from './pages/citizen/AboutDelhiConnectPage';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminHeatmap from './pages/admin/AdminHeatmap';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';

// Route guards
function RequireAuth({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/track" element={<TrackComplaintPage />} />
      <Route path="/track/:id" element={<TrackComplaintPage />} />

      {/* Citizen */}
      <Route path="/my-complaints" element={
        <RequireAuth roles={['citizen', 'admin', 'officer']}>
          <MyComplaintsPage />
        </RequireAuth>
      } />
      <Route path="/all-grievances" element={
        <RequireAuth roles={['citizen', 'admin', 'officer']}>
          <AllGrievancesPage />
        </RequireAuth>
      } />
      <Route path="/about-delhiconnect" element={
        <RequireAuth roles={['citizen', 'admin', 'officer']}>
          <AboutDelhiConnectPage />
        </RequireAuth>
      } />

      {/* Officer */}
      <Route path="/officer/dashboard" element={
        <RequireAuth roles={['officer', 'admin']}>
          <OfficerDashboard />
        </RequireAuth>
      } />

      {/* Admin */}
      <Route path="/admin/overview" element={
        <RequireAuth roles={['admin']}>
          <AdminOverview />
        </RequireAuth>
      } />
      <Route path="/admin/complaints" element={
        <RequireAuth roles={['admin']}>
          <AdminComplaints />
        </RequireAuth>
      } />
      <Route path="/admin/heatmap" element={
        <RequireAuth roles={['admin']}>
          <AdminHeatmap />
        </RequireAuth>
      } />
      <Route path="/admin/analytics" element={
        <RequireAuth roles={['admin']}>
          <AdminAnalytics />
        </RequireAuth>
      } />
      <Route path="/admin/reports" element={
        <RequireAuth roles={['admin']}>
          <AdminReports />
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
