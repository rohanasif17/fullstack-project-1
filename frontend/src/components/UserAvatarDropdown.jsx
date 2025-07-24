import React, { useEffect, useState, useRef } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';

const dropdownFont = {
  fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
  fontWeight: 600,
  color: '#fff',
  fontSize: 16,
  letterSpacing: 0.1,
};

const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #fff',
  marginRight: 10,
  background: '#222',
};

const arrowStyle = {
  width: 18,
  height: 18,
  marginLeft: 4,
  verticalAlign: 'middle',
  fill: '#fff',
  display: 'inline-block',
};

const menuStyle = {
  background: '#232323',
  borderRadius: 10,
  minWidth: 210,
  padding: '8px 0',
  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
  border: 'none',
};

const itemStyle = {
  ...dropdownFont,
  color: '#fff',
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  padding: '10px 20px',
  cursor: 'pointer',
  borderRadius: 6,
  transition: 'background 0.15s',
};

const dividerStyle = {
  margin: '6px 0',
  borderTop: '1px solid #333',
};

const UserAvatarDropdown = ({ onShowChangePassword, onShowEditDetails, onShowChangeAvatar, onShowChangeCover }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    getCurrentUser()
      .then(res => setUser(res.data?.data || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <Dropdown align="end" ref={dropdownRef}>
      <Dropdown.Toggle
        as="div"
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', ...dropdownFont }}
        id="user-avatar-dropdown-toggle"
      >
        <span style={arrowStyle}>
          {/* Inline SVG for down arrow */}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 8L10 13L15 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu style={menuStyle}>
        <div style={{ padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: 16 }}>
          {(user.fullName || user.username)?.split(' ')[0]}
        </div>
        <div style={dividerStyle} />
        <Dropdown.Item as="button" style={itemStyle} onClick={() => navigate('/publishvideo')}>
          Publish a Video
        </Dropdown.Item>
        <div style={dividerStyle} />
        <Dropdown.Item as="button" style={itemStyle} onClick={onShowChangePassword}>
          Change Password
        </Dropdown.Item>
        <Dropdown.Item as="button" style={itemStyle} onClick={onShowEditDetails}>
          Edit Details
        </Dropdown.Item>
        <Dropdown.Item as="button" style={itemStyle} onClick={onShowChangeAvatar}>
          Change Avatar
        </Dropdown.Item>
        <Dropdown.Item as="button" style={itemStyle} onClick={onShowChangeCover}>
          Change Cover Image
        </Dropdown.Item>
        <div style={dividerStyle} />
        <Dropdown.Item as="button" style={{ ...itemStyle, color: '#ff4d4f' }} onClick={async () => { await logout(); navigate('/'); }}>
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserAvatarDropdown; 