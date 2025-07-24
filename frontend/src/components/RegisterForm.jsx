import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ErrorMessage from './ErrorMessage';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    avatar: null,
    coverImage: null,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
    setIsSubmitting(true);
    setErrorMsg('');
    setShowError(false);

    // Validate avatar is an image
    if (!formData.avatar || !formData.avatar.type.startsWith('image/')) {
      setErrorMsg('Avatar is required and must be an image.');
      setShowError(true);
      setIsSubmitting(false);
      return;
    }
    // If coverImage is present, validate it's an image
    if (formData.coverImage && !formData.coverImage.type.startsWith('image/')) {
      setErrorMsg('Cover image must be an image file.');
      setShowError(true);
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('avatar', formData.avatar);
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage);
    }

    try {
      await api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Auto-login after successful registration
      try {
        await api.post('/users/login', {
          email: formData.email,
          password: formData.password
        });
        if (setIsAuthenticated) setIsAuthenticated(true);
        navigate('/homepage');
      } catch (loginError) {
        setErrorMsg('Registration succeeded, but auto-login failed. Please log in manually.');
        setShowError(true);
        // Optionally, navigate('/login');
      }
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message || 'Registration failed. Please try again.'
      );
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Register</h2>
        <p style={styles.subheading}>Create your account to get started.</p>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={styles.rowInputs}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{ ...styles.input, ...styles.halfInput, marginRight: '0.5rem' }}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ ...styles.input, ...styles.halfInput }}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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
          <label style={styles.label}>Avatar (required)</label>
          <div style={styles.fileWrapper}>
            <label style={styles.fileButton}>
              Choose File
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                required
                style={styles.hiddenFileInput}
              />
            </label>
            <span style={styles.fileName}>{formData.avatar ? formData.avatar.name : 'No file chosen'}</span>
          </div>
          <label style={styles.label}>Cover Image (optional)</label>
          <div style={styles.fileWrapper}>
            <label style={styles.fileButton}>
              Choose File
              <input
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleChange}
                style={styles.hiddenFileInput}
              />
            </label>
            <span style={styles.fileName}>{formData.coverImage ? formData.coverImage.name : 'No file chosen'}</span>
          </div>
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.linkText}>
          Already have an account? <a href="/login" style={styles.link}>Login</a>
        </p>
        <ErrorMessage message={errorMsg} visible={showError} />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  container: {
    backgroundColor: '#1e1e1e',
    padding: '1.2rem',
    borderRadius: '8px',
    width: '380px',
    color: 'white',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '0.5rem',
  },
  subheading: {
    fontSize: '14px',
    marginBottom: '1rem',
    color: '#ccc',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.75rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#333',
    color: 'white',
  },
  label: {
    color: '#ccc',
    fontSize: '13px',
    marginBottom: '0.25rem',
    display: 'block',
  },
  fileWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  fileButton: {
    backgroundColor: '#fff',
    color: '#111',
    padding: '0.35rem 0.8rem',
    border: '2px solid #111',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '0.5rem',
    display: 'inline-block',
    position: 'relative',
    overflow: 'hidden',
    fontSize: '13px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  hiddenFileInput: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
  fileName: {
    color: '#ccc',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
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
    fontSize: '14px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    borderBottom: '1px solid #fff',
    fontWeight: 'bold',
    paddingBottom: '2px',
    transition: 'color 0.2s',
  },
  rowInputs: {
    display: 'flex',
    flexDirection: 'row',
  },
  halfInput: {
    width: '50%',
    minWidth: 0,
  },
};

export default RegisterForm; 