import React from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/api';

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

// Images are imported statically above so they get processed by the bundler and
// hashed for cache-busting. Each side (left/right) has the same number of images
// for visual balance.

// Left-hand images (7)
const leftImages = [
  { src: micImg,         top: '3%',  left: '-40px', rotation:  -15, width: 95 },
  { src: newspaperImg,   top: '10%', left: '30px',  rotation:   12, width: 110 },
  { src: headphonesImg,  top: '23%', left: '-60px', rotation:   20, width: 120 },
  { src: controllerImg,  top: '38%', left: '15px',  rotation:   -8, width: 100 },
  { src: pcImg,          top: '55%', left: '-45px', rotation:   18, width: 118 },
  { src: natureBookImg,  top: '70%', left: '25px',  rotation:  -12, width: 110 },
  { src: globeImg,       top: '85%', left: '-35px', rotation:    6, width: 115 },
];

// Right-hand images (6)
const rightImages = [
  { src: comedyNightImg, top: '6%',  right: '-50px', rotation:  15, width: 115 },
  { src: cameraImg,      top: '20%', right: '35px',  rotation: -20, width: 120 },
  { src: phoneImg,       top: '34%', right: '-40px', rotation:  10, width: 105 },
  { src: singingImg,     top: '50%', right: '10px',  rotation:  -6, width: 110 },
  { src: uploadImg,      top: '66%', right: '-40px', rotation:  18, width: 115 },
  { src: websiteImg,     top: '83%', right: '30px',  rotation: -14, width: 120 },
];


const LandingPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated && setIsAuthenticated(true);
      navigate('/homepage');
    } catch (err) {
      navigate('/register');
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Decorative side images – left */}
      {leftImages.map((img, idx) => (
        <img
          key={`left-${idx}`}
          src={img.src}
          alt="decorative"
          style={{
            ...styles.sideImage,
            top: img.top,
            left: img.left,
            width: img.width,
            transform: `rotate(${img.rotation}deg)`,
          }}
        />
      ))}

      {/* Decorative side images – right */}
      {rightImages.map((img, idx) => (
        <img
          key={`right-${idx}`}
          src={img.src}
          alt="decorative"
          style={{
            ...styles.sideImage,
            top: img.top,
            right: img.right,
            width: img.width,
            transform: `rotate(${img.rotation}deg)`,
          }}
        />
      ))}

      {/* Top-right auth buttons */}
      <div style={styles.authButtons}>
        <button style={styles.loginButton} className="button-landing" onClick={() => navigate('/login')}>Login</button>
        <button style={styles.registerButton} className="button-landing blur-hover" onClick={() => navigate('/register')}>Register</button>
      </div>

      <div style={styles.left}>
        <h1 style={styles.heading}>Post It. Tweet It. Stream It. Own It.</h1>
        <p style={styles.subheading}>
          Whether it’s a late-night thought, a new playlist drop, or a viral video, this is your space to create, connect, and share without limits.
        </p>
        <button style={styles.getStartedButton} className="button-landing blur-hover" onClick={handleGetStarted}>Get Started</button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative',  // enables absolutely-positioned side images
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#111', // Dark background
    color: '#fff',           // Default text color white
    padding: '0 5vw',
    boxSizing: 'border-box',
    overflow: 'visible',     // allow decorative images to extend beyond wrapper
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
    color: '#fff', // White heading text
    lineHeight: 1.1,
    zIndex: 1,    // make sure text stays above images
  },
  subheading: {
    fontSize: '1rem',
    marginBottom: '2.2rem',
    color: '#ccc', // Light grey subheading for contrast
    lineHeight: 1.6,
    maxWidth: '32rem',
    zIndex: 1,
  },
  authButtons: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  },
  loginButton: {
    padding: '0.6rem 1.8rem',
    fontSize: '0.9rem',
    backgroundColor: '#fff', // Light button on dark bg
    color: '#111',           // Dark text
    border: '2px solid #fff',
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  registerButton: {
    padding: '0.6rem 1.8rem',
    fontSize: '0.9rem',
    backgroundColor: 'transparent',
    color: '#fff',              // White text on dark bg
    border: '2px solid #fff',   // White border for visibility
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  getStartedButton: {
    padding: '0.8rem 2.2rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    color: '#fff',              // White text
    border: '2px solid #fff',   // White border
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
    alignSelf: 'flex-start',
    zIndex: 1,
  },

  // Base style shared by all side images
  sideImage: {
    position: 'absolute',
    zIndex: 0,           // behind main text/buttons
    pointerEvents: 'none', // ensure images don't block interactions
    userSelect: 'none',
  },
};

export default LandingPage; 