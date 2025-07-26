import React from 'react';
import { avatarImageSample, coverImageSample } from '../../public/imageUrl';

const UserProfileCard = ({
  user,
  currentUser,
  isSubscribed,
  subCount,
  subscribing,
  onToggleSubscription,
}) => {
  if (!user) return null;
  const coverUrl = user.coverImage?.url || coverImageSample;
  const avatarUrl = user.avatar?.url || avatarImageSample;
  const fullName = user.fullName || 'Unknown';
  const username = user.username ? `@${user.username}` : '';
  const isOwnProfile = currentUser && user && currentUser._id === user._id;

  const styles = {
    card: {
      maxWidth: 850,
      minWidth: 650,
      flex: '0 0 850px',
      background: '#181818',
      borderRadius: 16,
      boxShadow: '0 4px 24px #0008',
      overflow: 'hidden',
      color: '#fff',
      marginLeft: 20, // Reduced from 40
    },
    cover: {
      position: 'relative',
      height: 120, // Decreased from 200
      background: '#222',
    },
    coverImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    avatar: {
      position: 'absolute',
      left: 32, // Slightly closer to the left
      bottom: -36, // Decreased offset
      width: 72, // Decreased from 120
      height: 72, // Decreased from 120
      borderRadius: '50%',
      border: '4px solid #181818', // Thinner border
      background: '#222',
      objectFit: 'cover',
      boxShadow: '0 2px 16px #000a',
    },
    info: {
      padding: '40px 24px 8px 24px', // Decreased top and side padding
      textAlign: 'left',
    },
    nameRow: {
      fontSize: 32,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      marginBottom: 8, // Added small margin for spacing
    },
    username: {
      fontSize: 20,
      color: '#aaa',
      marginBottom: 12, // Reduced from 20
    },
    statsRow: {
      display: 'flex',
      gap: 32,
      marginTop: 8, // Reduced from 16
    },
    stat: {
      fontSize: 18,
      color: '#fff',
    },
    statNum: {
      color: '#4fc3f7',
    },
    subscribeBtn: {
      background: '#4fc3f7',
      color: '#fff',
      border: 'none',
      borderRadius: 20,
      padding: '8px 24px',
      fontWeight: 600,
      fontSize: 16,
      cursor: 'pointer',
      marginLeft: 24,
      transition: 'background 0.2s',
    },
    subscribedBtn: {
      background: '#222',
      color: '#4fc3f7',
      border: '1.5px solid #4fc3f7',
      borderRadius: 20,
      padding: '8px 24px',
      fontWeight: 600,
      fontSize: 16,
      cursor: 'pointer',
      marginLeft: 24,
      transition: 'background 0.2s',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.cover}>
        <img src={coverUrl} alt="cover" style={styles.coverImg} />
        <img src={avatarUrl} alt="avatar" style={styles.avatar} />
      </div>
      <div style={styles.info}>
        <div style={styles.nameRow}>
          {fullName}
          {!isOwnProfile && (
            <button
              onClick={onToggleSubscription}
              style={isSubscribed ? styles.subscribedBtn : styles.subscribeBtn}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
        <div style={styles.username}>{username}</div>
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            Subscribers <span style={styles.statNum}>({subCount})</span>
          </div>
          <div style={styles.stat}>
            Subscribing <span style={styles.statNum}>({subscribing})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard; 