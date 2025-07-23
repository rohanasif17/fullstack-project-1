import React from 'react';
import './VideoCardSkeleton.css';

// Skeleton placeholder that mimics the exact dimensions & layout of a VideoCard
const VideoCardSkeleton = () => {
  return (
    <div className="video-card" style={styles.card}>
      {/* Thumbnail skeleton */}
      <div className="skeleton" style={styles.thumbnail} />

      {/* Info section skeletons */}
      <div style={styles.infoSection}>
        <div className="skeleton" style={{ ...styles.title, width: '80%' }} />

        <div style={styles.ownerRow}>
          <div className="skeleton" style={styles.avatar} />
          <div className="skeleton" style={{ ...styles.ownerName, width: '60%' }} />
        </div>

        <div className="skeleton" style={{ ...styles.stats, width: '40%' }} />
      </div>
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
  },
  thumbnail: {
    width: '100%',
    paddingTop: '56.25%', // 16:9 ratio
  },
  infoSection: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  title: {
    height: 16,
    borderRadius: 4,
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
  },
  ownerName: {
    flex: 1,
    height: 14,
    borderRadius: 4,
  },
  stats: {
    height: 12,
    borderRadius: 4,
  },
};

export default VideoCardSkeleton; 