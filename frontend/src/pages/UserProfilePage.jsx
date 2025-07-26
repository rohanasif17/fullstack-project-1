import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername, toggleChannelSubscription, getCurrentUser } from '../services/api';
import UserProfileCard from '../components/UserProfileCard';
import ContentTabs from '../components/ContentTabs';
import ErrorMessage from '../components/ErrorMessage';

const UserProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch both user profile and current user data
        const [userResponse, currentUserResponse] = await Promise.all([
          getUserByUsername(username),
          getCurrentUser()
        ]);

        setUser(userResponse.data.data);
        setCurrentUser(currentUserResponse.data.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to load user profile');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleToggleSubscription = async () => {
    try {
      const response = await toggleChannelSubscription(user._id);
      // Update the user data with new subscription status
      setUser(prevUser => ({
        ...prevUser,
        isSubscribed: !prevUser.isSubscribed,
        subscribersCount: prevUser.isSubscribed 
          ? prevUser.subscribersCount - 1 
          : prevUser.subscribersCount + 1
      }));
    } catch (err) {
      setError('Failed to update subscription');
      setShowError(true);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#fff'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#fff'
      }}>
        <div>User not found</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '40px'
    }}>
      {showError && <ErrorMessage message={error} />}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 1200, alignItems: 'center' }}>
        <UserProfileCard
          user={user}
          currentUser={currentUser}
          isSubscribed={user.isSubscribed}
          subCount={user.subscribersCount}
          subscribing={user.channelsSubscribedToCount}
          onToggleSubscription={handleToggleSubscription}
        />
        {user && user._id && (
          <ContentTabs 
            userId={user._id} 
            isOwnProfile={false}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfilePage; 