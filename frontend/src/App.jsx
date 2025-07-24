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
import { getCurrentUser } from './services/api';
import UserAvatarDropdown from './components/UserAvatarDropdown';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showChangeAvatar, setShowChangeAvatar] = useState(false);
  const [showChangeCover, setShowChangeCover] = useState(false);

  // Restore authentication state on mount
  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // We need location inside Router context → define inner component
  const AppContent = () => {
    const location = useLocation();
    // Only show dropdown on homepage for authenticated users
    const showUserDropdown = isAuthenticated && location.pathname === '/homepage';

    return (
      <>
        {showUserDropdown && (
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1100 }}>
            <UserAvatarDropdown
              onShowChangePassword={() => setShowChangePassword(true)}
              onShowEditDetails={() => setShowEditDetails(true)}
              onShowChangeAvatar={() => setShowChangeAvatar(true)}
              onShowChangeCover={() => setShowChangeCover(true)}
            />
          </div>
        )}
        <Routes>
          <Route path="/" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<RegisterPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/homepage" element={<VideosPage />} />
          <Route path="/v/:id" element={<VideoPlayerPage />} />
          <Route path="/publishvideo" element={<PublishVideoPage />} />
          {/* Redirect root to landing page */}
          <Route path="/" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Modals triggered from dropdown */}
        <ChangePasswordModal show={showChangePassword} onHide={() => setShowChangePassword(false)} />
        <UpdateDetailsModal show={showEditDetails} onHide={() => setShowEditDetails(false)} />
        <ChangeAvatarModal show={showChangeAvatar} onHide={() => setShowChangeAvatar(false)} />
        <ChangeCoverImageModal show={showChangeCover} onHide={() => setShowChangeCover(false)} />
      </>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
