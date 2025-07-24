import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import VideosPage from './pages/VideosPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChangePasswordModal from './components/ChangePasswordModal';
import UpdateDetailsModal from './components/UpdateDetailsModal';
import ChangeAvatarModal from './components/ChangeAvatarModal';
import ChangeCoverImageModal from './components/ChangeCoverImageModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/website" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/homepage" element={<VideosPage />} />
        {/* Redirect root to landing page */}
        <Route path="/" element={<Navigate to="/website" replace />} />
      </Routes>

      {/* Utility Modals only for authenticated users */}
      {isAuthenticated && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1050, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ChangePasswordModal />
          <UpdateDetailsModal />
          <ChangeAvatarModal />
          <ChangeCoverImageModal />
        </div>
      )}
    </Router>
  );
}

export default App
