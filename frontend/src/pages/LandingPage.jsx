import React from 'react';
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <h1 style={styles.heading}>Post It. Tweet It. Stream It. Own It.</h1>
        <p style={styles.subheading}>
          Whether it’s a late-night thought, a new playlist drop, or a viral video, this is your space to create, connect, and share without limits.
        </p>
        <div style={styles.buttonGroup}>
          <button style={styles.loginButton} onClick={() => navigate('/login')}>Login</button>
          <button style={styles.registerButton} onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#fff',
    color: '#111',
    padding: '0 5vw',
    boxSizing: 'border-box',
  },
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: '320px',
    maxWidth: '480px',
  },
  heading: {
    fontSize: '4rem',
    fontWeight: 900,
    marginBottom: '1.2rem',
    color: '#111',
    lineHeight: 1.1,
  },
  subheading: {
    fontSize: '1rem',
    marginBottom: '2.2rem',
    color: '#222',
    lineHeight: 1.6,
    maxWidth: '32rem',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  },
  loginButton: {
    padding: '0.8rem 2.2rem',
    fontSize: '1rem',
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  registerButton: {
    padding: '0.8rem 2.2rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    color: '#111',
    border: '2px solid #111',
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
};

export default LandingPage; 