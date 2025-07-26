import React, {useEffect, useState} from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

const LoginForm = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('')
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmail = formData.identifier.includes('@');
    const payload = {
      [isEmail ? 'email' : 'username']: formData.identifier,
      password: formData.password
    };
  
    try {
      await api.post('/users/login', payload);
      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate('/homepage');
    } catch (error) {
      setErrorMsg('Invalid credentials. Please try again.');
      setShowError(true)
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Login</h2>
        <p style={styles.subheading}>Enter your credentials to access your account.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="identifier"
            placeholder="Email or Username"
            value={formData.identifier}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {/* Password input with show/hide button in a row */}
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ ...styles.input, paddingRight: '60px', marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#ccc',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                padding: 0,
              }}
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.linkText}>Don't have an account? <a href="/register" style={styles.link}>Register</a></p>
        <ErrorMessage message={errorMsg} visible={showError} />
      </div>
    </div>
  );
}


const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111'
  },
  container: {
    backgroundColor: '#1e1e1e',
    padding: '2rem',
    borderRadius: '8px',
    width: '300px',
    color: 'white',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '0.5rem'
  },
  subheading: {
    fontSize: '14px',
    marginBottom: '1rem',
    color: '#ccc'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.75rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#333',
    color: 'white'
  },
  button: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '2px solid #111',
    borderRadius: '4px',
    color: '#111',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '14px'
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    borderBottom: '1px solid #fff',
    fontWeight: 'bold',
    paddingBottom: '2px',
    transition: 'color 0.2s',
  }
};

export default LoginForm