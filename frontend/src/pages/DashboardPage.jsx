import React, { useEffect, useState } from 'react';
import { getCurrentUser, getDashboardStats, getUserSubscriptions } from '../services/api';
import { avatarImageSample, coverImageSample } from '../../public/imageUrl';
import UserProfileCard from '../components/UserProfileCard';
import ContentTabs from '../components/ContentTabs';

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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 48, margin: '48px 0', width: '100%' }}>
        {/* Profile Card */}
        <UserProfileCard
          user={user}
          currentUser={user} // Assuming currentUser is the logged-in user
          isSubscribed={false} // Placeholder, needs actual subscription logic
          subCount={stats?.totalSubscribers || 0}
          subscribing={subscribing}
          onToggleSubscription={() => {}} // Placeholder, needs actual subscription logic
        />
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
      
      {/* User Content Tabs */}
      {user && user._id && (
        <ContentTabs userId={user._id} isOwnProfile={true} currentUser={user} />
      )}
    </div>
  );
};

export default DashboardPage; 