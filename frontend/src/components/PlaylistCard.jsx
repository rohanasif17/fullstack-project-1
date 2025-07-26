import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PlaylistCard.css';
import defualtPlaylistImg from '../../assets/defualt-playlist.png';

const PlaylistCard = ({ playlist, onUpdate, onDelete, currentUser }) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!playlist) return null;

  // Get the first video's thumbnail as the playlist preview
  const firstVideo = playlist.videos && playlist.videos.length > 0 ? playlist.videos[0] : null;
  const thumbnail = firstVideo?.thumbnail || defualtPlaylistImg;
  const videoCount = playlist.videos ? playlist.videos.length : 0;

  const isOwner = currentUser && playlist.owner && (playlist.owner._id === currentUser._id || playlist.owner === currentUser._id);

  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (onUpdate) onUpdate(playlist);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(playlist);
  };

  return (
    <div className="playlist-card">
      <Link to={`/playlist/${playlist._id}`} className="playlist-card-link">
        <div className="playlist-card-thumbnail-wrapper">
          <img 
            src={thumbnail} 
            alt={playlist.name} 
            className="playlist-card-thumbnail" 
          />
          <div className="playlist-card-overlay">
            <div className="playlist-card-play-button">
              <span>▶</span>
            </div>
            <div className="playlist-card-play-text">Play all</div>
          </div>
          <div className="playlist-card-video-count">
            <span className="playlist-card-count-icon">☰</span>
            <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="playlist-card-info">
          <h3 className="playlist-card-title">{playlist.name}</h3>
        </div>
      </Link>
      
      {/* 3-dots menu, only for owner */}
      {isOwner && (
        <div className="playlist-card-menu-container">
          <button 
            className="playlist-card-menu-button"
            onClick={handleMenuToggle}
            onMouseEnter={() => setShowMenu(true)}
          >
            ⋯
          </button>
          {showMenu && (
            <div 
              className="playlist-card-menu"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button className="playlist-card-menu-item" onClick={handleUpdate}>
                Update
              </button>
              <button className="playlist-card-menu-item playlist-card-menu-item-delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard; 