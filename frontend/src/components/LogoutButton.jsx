import Button from 'react-bootstrap/Button';
import { logout } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function LogoutButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="dark" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </Button>
      {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
    </>
  );
}

export default LogoutButton;