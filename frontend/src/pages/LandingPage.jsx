import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <h1 style={styles.heading}>Build advanced prototypes</h1>
        <p style={styles.subheading}>
          Design better products with States,<br />
          Variables, Auto Layout and more.
        </p>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={() => navigate('/register')}>Register</button>
          <button style={{ ...styles.button, marginLeft: '1rem' }} onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
      <div style={styles.right}>
        <img
          src="https://via.placeholder.com/350x200.png?text=Product+Screenshot"
          alt="Product Screenshot"
          style={styles.image}
        />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: '2.2rem',
    fontWeight: 700,
    marginBottom: '1.2rem',
    color: '#111',
  },
  subheading: {
    fontSize: '1.1rem',
    marginBottom: '2.2rem',
    color: '#222',
    lineHeight: 1.5,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  },
  button: {
    padding: '0.8rem 2.2rem',
    fontSize: '1.1rem',
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '320px',
  },
  image: {
    width: '350px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    background: '#eee',
  },
};

export default LandingPage; 