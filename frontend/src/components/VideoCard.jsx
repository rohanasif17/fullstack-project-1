import React, { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './VideoCard.css';
import AddToPlaylistModal from './AddToPlaylistModal';

const VideoCard = ({ video, small, active, disableNavigation }) => {
  const navigate = useNavigate();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  
  if (!video) return null;

  const {
    thumbnail,
    duration,
    title,
    owner,
    views = 0,
    createdAt,
    category,
  } = video;

  const formatDuration = (sec) => {
    if (!sec && sec !== 0) return '';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatViews = (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num;
  };

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

  const handleOwnerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ownerData = Array.isArray(owner) ? owner[0] : owner;
    if (ownerData?.username) {
      navigate(`/users/c/${ownerData.username}`);
    }
  };

  const handleAddToPlaylist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddToPlaylist(true);
  };

  return (
    <div className={`video-card-container${small ? ' video-card-small' : ''}${active ? ' video-card-active' : ''}`}>
      {disableNavigation ? (
        <div className="video-card-link" style={{ textDecoration: 'none' }}>
          <div className="video-card-outer">
            <div className="video-card-thumbnail-wrapper">
              <img src={thumbnail} alt={title} className="video-card-thumbnail" />
              {/* Duration */}
              {duration !== undefined && (
                <span className="video-card-duration">{formatDuration(duration)}</span>
              )}
            </div>
            <div className="video-card-info">
              <div className="video-card-row">
                <img
                  src={(Array.isArray(owner) ? owner[0]?.avatar?.url : owner?.avatar?.url) || 'https://ui-avatars.com/api/?name=User'}
                  alt={(Array.isArray(owner) ? owner[0]?.fullName : owner?.fullName) || 'Avatar'}
                  className="video-card-avatar"
                />
                <div className="video-card-title">{title}</div>
              </div>
              <div className="video-card-meta">
                <span 
                  className="video-card-owner clickable-owner"
                  onClick={handleOwnerClick}
                >
                  {(Array.isArray(owner) ? owner[0]?.fullName : owner?.fullName) || 'Unknown'}
                </span>
                <span className="video-card-dot">•</span>
                <span className="video-card-views">{formatViews(views)} views</span>
                <span className="video-card-dot">•</span>
                <span className="video-card-time">{timeAgo(createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link to={`/v/${video._id}`} style={{ textDecoration: 'none' }} className="video-card-link">
          <div className="video-card-outer">
            <div className="video-card-thumbnail-wrapper">
              <img src={thumbnail} alt={title} className="video-card-thumbnail" />
              {/* Duration */}
              {duration !== undefined && (
                <span className="video-card-duration">{formatDuration(duration)}</span>
              )}
            </div>
            <div className="video-card-info">
              <div className="video-card-row">
                <img
                  src={(Array.isArray(owner) ? owner[0]?.avatar?.url : owner?.avatar?.url) || 'https://ui-avatars.com/api/?name=User'}
                  alt={(Array.isArray(owner) ? owner[0]?.fullName : owner?.fullName) || 'Avatar'}
                  className="video-card-avatar"
                />
                <div className="video-card-title">{title}</div>
              </div>
              <div className="video-card-meta">
                <span 
                  className="video-card-owner clickable-owner"
                  onClick={handleOwnerClick}
                >
                  {(Array.isArray(owner) ? owner[0]?.fullName : owner?.fullName) || 'Unknown'}
                </span>
                <span className="video-card-dot">•</span>
                <span className="video-card-views">{formatViews(views)} views</span>
                <span className="video-card-dot">•</span>
                <span className="video-card-time">{timeAgo(createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>
      )}
      
      {/* Add to Playlist Button */}
      <button
        className="video-card-add-to-playlist"
        onClick={handleAddToPlaylist}
        title="Add to Playlist"
      >
        📁
      </button>

      <AddToPlaylistModal
        show={showAddToPlaylist}
        onHide={() => setShowAddToPlaylist(false)}
        video={video}
      />
    </div>
  );
};

const styles = {
  card: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent', // blend with page background
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9 ratio
    // background: '#dcdcdc', // Remove background color
    overflow: 'hidden', // Ensure border radius is respected
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px', // Added border radius
  },
  playIconWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 12,
  },
  infoSection: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    color: '#ffffff',
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ownerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  ownerName: {
    fontSize: 14,
    color: '#c7c7c7',
  },
  stats: {
    fontSize: 12,
    color: '#a1a1a1',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f5d547',
  },
};

export default memo(VideoCard); 