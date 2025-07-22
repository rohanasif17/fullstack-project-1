import React, {use, useState} from 'react'
import api from '../services/api'

const loginForm = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmail = formData.identifier.includes('@');
    const payload = {
      [isEmail ? 'email' : 'username']: formData.identifier,
      password: formData.password
    };
  
    try {
      const res = await api.post('/users/login', payload);
      console.log('User:', res.data.data.user);
    } catch (error) {
      console.log(error.response?.data?.message || 'Login failed');
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
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.linkText}>Don't have an account? <a href="/register" style={styles.link}>Register</a></p>
      </div>
    </div>
  );
}
const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
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
    backgroundColor: '#00bfff',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer'
  },
  linkText: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '14px'
  },
  link: {
    color: '#00bfff',
    textDecoration: 'none'
  }
};


export default loginForm