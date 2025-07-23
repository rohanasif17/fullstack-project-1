import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import VideosPage from './pages/VideosPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChangePasswordModal from './components/ChangePasswordModal';
import UpdateDetailsModal from './components/UpdateDetailsModal';

// Component to verify authentication status on app load
const AuthVerifier = ({ onDone, setIsAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
        navigate('/homepage');
      } catch (err) {
        // Not authenticated – remain guest
        setIsAuthenticated(false);
      }
      // Inform parent that auth check is finished
      onDone();
    };

    verify();
  }, [navigate, onDone, setIsAuthenticated]);

  return null;
};

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <Router>
        {/* Run auth verification once on load */}
        {!authChecked && (
          <AuthVerifier
            onDone={() => setAuthChecked(true)}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
        {authChecked && (
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/homepage" replace /> : <LandingPage />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/homepage" element={<VideosPage />} />
          </Routes>
        )}
        {authChecked && isAuthenticated && (
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1050, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ChangePasswordModal />
            <UpdateDetailsModal />
          </div>
        )}
      </Router>
    </>
  );
}

export default App
