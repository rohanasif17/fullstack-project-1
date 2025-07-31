import React, { useState, useRef, useEffect } from 'react';
import './TweetCard.css';

const TweetCard = ({ tweet, onLike, currentUser, onUpdate, onDelete }) => {
  if (!tweet) return null;
  const { owner, content, likesCount = 0, isLiked = false, _id } = tweet;
  const isOwner = currentUser?._id && tweet?.owner?._id === currentUser._id;
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

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const intervals = [
      { label: 'year', secs: 31536000 },
      { label: 'month', secs: 2592000 },
      { label: 'week', secs: 604800 },
      { label: 'day', secs: 86400 },
      { label: 'hour', secs: 3600 },
      { label: 'minute', secs: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.secs);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  return (
    <div
      className="tweet-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <img
        className="tweet-card-avatar"
        src={owner?.avatar?.url || '/assets/default-avatar.png'}
        alt={owner?.fullName || 'Avatar'}
      />
      <div className="tweet-card-body">
        <div className="tweet-card-header">
          <span className="tweet-card-name">{owner?.fullName}</span>
          <span className="tweet-card-username">@{owner?.username}</span>
          {tweet.createdAt && (
            <span className="tweet-card-time">
              {timeAgo(tweet.createdAt)}
            </span>
          )}
        </div>
        <div className="tweet-card-content">{content}</div>
        <button
          className={`tweet-card-like${isLiked ? ' liked' : ''}`}
          onClick={() => onLike && onLike(tweet)}
          aria-label="Like tweet"
          disabled={isOwner}
          title={isOwner ? "You can't like your own tweet" : "Like tweet"}
        >
          <span role="img" aria-label="like">❤️</span> {likesCount}
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