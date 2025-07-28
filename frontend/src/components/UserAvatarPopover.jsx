import React, { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDownIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import './UserAvatarPopover.css';

const UserAvatarPopover = ({ onShowChangePassword, onShowEditDetails, onShowChangeAvatar, onShowChangeCover }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="PopoverTrigger" aria-label="User menu">
          <img 
            src={user?.avatar?.url || 'https://via.placeholder.com/36x36/222/fff?text=U'} 
            alt="User avatar"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#222',
            }}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" side="bottom" sideOffset={5} align="end" collisionPadding={10}>
          <div className="PopoverUserInfo">
            <img 
              src={user?.avatar?.url || 'https://via.placeholder.com/40x40/222/fff?text=U'} 
              alt="User avatar"
              className="PopoverUserAvatar"
            />
            <div className="PopoverUserDetails">
              <div className="PopoverUserName">{user?.fullName || user?.username}</div>
              <div className="PopoverUserEmail">@{user?.username}</div>
              <button 
                className="PopoverViewChannel"
                onClick={() => navigate('/dashboard')}
              >
                View your channel
              </button>
            </div>
          </div>
          <div className="PopoverDivider" />
          
          <button 
            className="PopoverMenuItem" 
            onClick={() => navigate('/publishvideo')}
          >
            Publish a Video
          </button>
          
          <div className="PopoverDivider" />
          
          <button 
            className="PopoverMenuItem" 
            onClick={onShowChangePassword}
          >
            Change Password
          </button>
          
          <button 
            className="PopoverMenuItem" 
            onClick={onShowEditDetails}
          >
            Edit Details
          </button>
          
          <button 
            className="PopoverMenuItem" 
            onClick={onShowChangeAvatar}
          >
            Change Avatar
          </button>
          
          <button 
            className="PopoverMenuItem" 
            onClick={onShowChangeCover}
          >
            Change Cover Image
          </button>
          
          <div className="PopoverDivider" />
          
          <button 
            className="PopoverMenuItem logout" 
            onClick={handleLogout}
          >
            Logout
          </button>
          
          <Popover.Close className="PopoverClose" aria-label="Close">
            <Cross2Icon />
          </Popover.Close>
          <Popover.Arrow className="PopoverArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default UserAvatarPopover; 