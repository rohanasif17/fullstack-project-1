import React, {useEffect, useState} from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

// Decorative asset imports (located in frontend/assets)
import controllerImg from '../../assets/controller.png';
import comedyNightImg from '../../assets/comedy-night.png';
import newspaperImg from '../../assets/newspaper.png';
import headphonesImg from '../../assets/headphones.png';
import pcImg from '../../assets/pc.png';
import cameraImg from '../../assets/camera.png';
import micImg from '../../assets/mic.png';
import globeImg from '../../assets/globe.png';
import phoneImg from '../../assets/phone.png';
import singingImg from '../../assets/singing.png';
import natureBookImg from '../../assets/nature-book.png';
import uploadImg from '../../assets/upload.png';
import websiteImg from '../../assets/website.png';

// Function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// All available images with their properties
const allImages = [
  { src: micImg,         top: '3%',  left: '-40px', rotation:  -15, width: 95 },
  { src: newspaperImg,   top: '10%', left: '30px',  rotation:   12, width: 110 },
  { src: headphonesImg,  top: '23%', left: '-60px', rotation:   20, width: 120 },
  { src: controllerImg,  top: '38%', left: '15px',  rotation:   -8, width: 100 },
  { src: pcImg,          top: '55%', left: '-45px', rotation:   18, width: 118 },
  { src: natureBookImg,  top: '70%', left: '25px',  rotation:  -12, width: 110 },
  { src: globeImg,       top: '85%', left: '-35px', rotation:    6, width: 115 },
  { src: comedyNightImg, top: '6%',  right: '-50px', rotation:  15, width: 115 },
  { src: cameraImg,      top: '20%', right: '35px',  rotation: -20, width: 120 },
  { src: phoneImg,       top: '34%', right: '-40px', rotation:  10, width: 105 },
  { src: singingImg,     top: '50%', right: '10px',  rotation:  -6, width: 110 },
  { src: uploadImg,      top: '66%', right: '-40px', rotation:  18, width: 115 },
  { src: websiteImg,     top: '83%', right: '30px',  rotation: -14, width: 120 },
];

const LoginForm = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('')
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Shuffle images on component mount
  const [shuffledImages] = useState(() => shuffleArray(allImages));

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
      {/* Decorative side images */}
      {shuffledImages.map((img, idx) => (
        <img
          key={`login-${idx}`}
          src={img.src}
          alt="decorative"
          style={{
            ...styles.sideImage,
            top: img.top,
            left: img.left,
            right: img.right,
            width: img.width,
            transform: `rotate(${img.rotation}deg)`,
          }}
        />
      ))}

      <div style={styles.container}>
        <h2 style={styles.heading}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <input
              type="text"
              name="identifier"
              placeholder="Username"
              value={formData.identifier}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
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
    position: 'relative',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  container: {
    backdropFilter: 'blur(10px)',
    padding: '2.5rem',
    borderRadius: '12px',
    width: '320px',
    color: 'white',
    zIndex: 2,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid white',
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '8px',
    color: '#111',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '1rem',
    transition: 'background-color 0.2s',
  },
  linkText: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'white',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  // Base style shared by all side images
  sideImage: {
    position: 'absolute',
    zIndex: 1,
    pointerEvents: 'none',
    userSelect: 'none',
  },
};

export default LoginForm