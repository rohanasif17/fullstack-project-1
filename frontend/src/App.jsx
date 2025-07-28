import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import VideosPage from './pages/VideosPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import PublishVideoPage from './pages/PublishVideoPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChangePasswordModal from './components/ChangePasswordModal';
import UpdateDetailsModal from './components/UpdateDetailsModal';
import ChangeAvatarModal from './components/ChangeAvatarModal';
import ChangeCoverImageModal from './components/ChangeCoverImageModal';
import { getCurrentUser, refreshToken } from './services/api';
import UserAvatarPopover from './components/UserAvatarPopover';
import Sidebar from './components/Sidebar';
import TweetsPage from './pages/TweetsPage';
import HistoryPage from './pages/HistoryPage';
import LikedVideosPage from './pages/LikedVideosPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';

// Move AppContent outside of App component to prevent recreation on every render
const AppContent = ({ 
  isAuthenticated, 
  setIsAuthenticated,
  showChangePassword,
  setShowChangePassword,
  showEditDetails,
  setShowEditDetails,
  showChangeAvatar,
  setShowChangeAvatar,
  showChangeCover,
  setShowChangeCover
}) => {
  const location = useLocation();
  // Only show dropdown on homepage for authenticated users
  const showUserDropdown = isAuthenticated && location.pathname === '/homepage';
  // Show sidebar on main app pages (not login/register/landing)
  const showSidebar = !['/', '/login', '/register'].includes(location.pathname);
  const [sidebarTab, setSidebarTab] = useState('history');
  // Sidebar open/collapsed state lifted up
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          activeTab={sidebarTab}
          setActiveTab={setSidebarTab}
        />
      )}
      <div
        style={{
          flex: 1,
          position: 'relative',
          marginLeft: showSidebar ? (sidebarOpen ? 240 : 72) : 0, // Adjust margin based on sidebar state
        }}
      >
        {showUserDropdown && (
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
            <UserAvatarPopover
              onShowChangePassword={() => {
                setShowEditDetails(false);
                setShowChangeAvatar(false);
                setShowChangeCover(false);
                setShowChangePassword(true);
              }}
              onShowEditDetails={() => {
                setShowChangePassword(false);
                setShowChangeAvatar(false);
                setShowChangeCover(false);
                setShowEditDetails(true);
              }}
              onShowChangeAvatar={() => {
                setShowChangePassword(false);
                setShowEditDetails(false);
                setShowChangeCover(false);
                setShowChangeAvatar(true);
              }}
              onShowChangeCover={() => {
                setShowChangePassword(false);
                setShowEditDetails(false);
                setShowChangeAvatar(false);
                setShowChangeCover(true);
              }}
            />
          </div>
        )}
        <Routes>
          <Route path="/" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<RegisterPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/homepage" element={<VideosPage />} />
          <Route path="/tweets" element={<TweetsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/liked-videos" element={<LikedVideosPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
          <Route path="/v/:id" element={<VideoPlayerPage />} />
          <Route path="/publishvideo" element={<PublishVideoPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users/c/:username" element={<UserProfilePage />} />
          {/* Redirect root to landing page */}
          <Route path="/" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Modals triggered from dropdown */}
        <ChangePasswordModal show={showChangePassword} onHide={() => setShowChangePassword(false)} />
        <UpdateDetailsModal show={showEditDetails} onHide={() => setShowEditDetails(false)} />
        <ChangeAvatarModal show={showChangeAvatar} onHide={() => setShowChangeAvatar(false)} />
        <ChangeCoverImageModal show={showChangeCover} onHide={() => setShowChangeCover(false)} />
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showChangeAvatar, setShowChangeAvatar] = useState(false);
  const [showChangeCover, setShowChangeCover] = useState(false);

  // Restore authentication state on mount with automatic token refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        // If getCurrentUser fails, try to refresh the token
        if (error.response?.status === 401) {
          try {
            await refreshToken();
            // Token refreshed successfully, try getCurrentUser again
            await getCurrentUser();
            setIsAuthenticated(true);
          } catch (refreshError) {
            // If refresh also fails, user is not authenticated
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <AppContent 
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        showChangePassword={showChangePassword}
        setShowChangePassword={setShowChangePassword}
        showEditDetails={showEditDetails}
        setShowEditDetails={setShowEditDetails}
        showChangeAvatar={showChangeAvatar}
        setShowChangeAvatar={setShowChangeAvatar}
        showChangeCover={showChangeCover}
        setShowChangeCover={setShowChangeCover}
      />
    </Router>
  );
}

export default App
