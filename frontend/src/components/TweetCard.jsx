import React, { useState, useRef, useEffect } from 'react';
import './TweetCard.css';

const TweetCard = ({ tweet, onLike, currentUser, onUpdate, onDelete }) => {
  if (!tweet) return null;
  const { user, content, likes = 0, likedByMe = false, _id } = tweet;
  const isOwner = currentUser?._id && tweet?.user?._id === currentUser._id;
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  return (
    <div
      className="tweet-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <img
        className="tweet-card-avatar"
        src={user?.avatar?.url || '/assets/default-avatar.png'}
        alt={user?.fullName || 'Avatar'}
      />
      <div className="tweet-card-body">
        <div className="tweet-card-header">
          <span className="tweet-card-name">{user?.fullName}</span>
          <span className="tweet-card-username">@{user?.username}</span>
        </div>
        <div className="tweet-card-content">{content}</div>
        <button
          className={`tweet-card-like${likedByMe ? ' liked' : ''}`}
          onClick={() => onLike && onLike(tweet)}
          aria-label="Like tweet"
          disabled={isOwner}
          title={isOwner ? "You can't like your own tweet" : "Like tweet"}
        >
          <span role="img" aria-label="like">❤️</span> {likes}
        </button>
      </div>
      {isOwner && (isHovered || showActions) && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} ref={menuRef}>
          <div onClick={() => setShowActions((prev) => !prev)} style={{ cursor: 'pointer', padding: 4 }}>
            <span style={{ color: '#fff', fontSize: 18 }}>⋮</span>
          </div>
          {showActions && (
            <div style={{ position: 'absolute', right: 0, top: 24, background: '#333', borderRadius: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.3)', minWidth: 100 }}>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setShowActions(false); onUpdate && onUpdate(tweet); }}>Update</button>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setShowActions(false); onDelete && onDelete(tweet); }}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TweetCard; 