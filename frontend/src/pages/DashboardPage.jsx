import React, { useEffect, useState } from 'react';
import { getCurrentUser, getDashboardStats, getUserSubscriptions } from '../services/api';
import { avatarImageSample, coverImageSample } from '../../public/imageUrl';

const statLabelStyle = { fontSize: 14, color: '#aaa', marginTop: 2 };
const statValueStyle = { fontSize: 22, fontWeight: 600 };

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState(0);
  const [subscribing, setSubscribing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let userId;
    getCurrentUser()
      .then((userRes) => {
        const userData = userRes.data?.data || null;
        setUser(userData);
        userId = userData?._id;
        return Promise.all([
          getDashboardStats(),
          getUserSubscriptions(userId)
        ]);
      })
      .then(([statsRes, subscribingRes]) => {
        setStats(statsRes.data?.data || null);
        setSubscribing(Array.isArray(subscribingRes.data?.data) ? subscribingRes.data.data.length : 0);
      })
      .catch(() => setError('Failed to load dashboard info'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#fff', padding: 32 }}>Loading...</div>;
  if (error || !user) return <div style={{ color: 'red', padding: 32 }}>{error || 'User not found'}</div>;

  const coverUrl = user.coverImage?.url || coverImageSample;
  const avatarUrl = user.avatar?.url || avatarImageSample;
  const fullName = user.fullName || 'Unknown';
  const username = user.username ? `@${user.username}` : '';

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 48, margin: '48px 0', width: '100%' }}>
      {/* Profile Card */}
      <div style={{ maxWidth: 850, minWidth: 650, flex: '0 0 850px', background: '#181818', borderRadius: 16, boxShadow: '0 4px 24px #0008', overflow: 'hidden', color: '#fff', marginLeft: 40 }}>
        <div style={{ position: 'relative', height: 220, background: '#222' }}>
          <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <img
            src={avatarUrl}
            alt="avatar"
            style={{
              position: 'absolute',
              left: 48,
              bottom: -56,
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '6px solid #181818',
              background: '#222',
              objectFit: 'cover',
              boxShadow: '0 2px 16px #000a',
            }}
          />
        </div>
        <div style={{ padding: '72px 40px 40px 40px', textAlign: 'left' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{fullName}</div>
          <div style={{ fontSize: 20, color: '#aaa', marginBottom: 20 }}>{username}</div>
          <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
            <div style={{ fontSize: 18, color: '#fff' }}>Subscribers <span style={{ color: '#4fc3f7' }}>({stats?.totalSubscribers || 0})</span></div>
            <div style={{ fontSize: 18, color: '#fff' }}>Subscribing <span style={{ color: '#4fc3f7' }}>({subscribing})</span></div>
          </div>
        </div>
      </div>
      {/* Stats Card */}
      <div style={{ width: 200, background: '#202020', borderRadius: 16, boxShadow: '0 4px 24px #0008', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 0', minHeight: 220, marginLeft: 'auto', marginRight: 40 }}>
        {stats ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={statValueStyle}>{stats.totalVideos}</div>
              <div style={statLabelStyle}>Videos</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={statValueStyle}>{stats.totalViews}</div>
              <div style={statLabelStyle}>Total Views</div>
            </div>
            <div>
              <div style={statValueStyle}>{stats.totalLikes}</div>
              <div style={statLabelStyle}>Total Likes</div>
            </div>
          </>
        ) : (
          <div style={{ color: '#aaa' }}>No stats found</div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 