import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoCard from './VideoCard';
import TweetCard from './TweetCard';
import PlaylistCard from './PlaylistCard';
import { 
  getDashboardVideos, 
  getUserVideos, 
  getUserTweets, 
  getCurrentUserPlaylists, 
  getUserPlaylists, 
  toggleTweetLike, 
  getCurrentUser 
} from '../services/api';

const ContentTabs = ({ userId, isOwnProfile = false, currentUser: propCurrentUser }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Reset state when userId changes
  useEffect(() => {
    if (userId) {
      setVideos([]);
      setTweets([]);
      setPlaylists([]);
      setLoading(false);
      setError('');
      setHasLoaded(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!userId || hasLoaded) {
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Use getUserVideos for both cases to ensure consistent data structure with owner details
        const videosApi = getUserVideos(userId);
        const tweetsApi = getUserTweets(userId);
        const playlistsApi = isOwnProfile ? getCurrentUserPlaylists() : getUserPlaylists(userId);


        const currentUserApi = propCurrentUser ? Promise.resolve({ data: { data: propCurrentUser } }) : getCurrentUser();

        const [videosRes, tweetsRes, playlistsRes, currentUserRes] = await Promise.all([
          videosApi,
          tweetsApi,
          playlistsApi,
          currentUserApi
        ]);

        // Ensure we always set arrays, even if the API returns something else
        // Handle paginated response format for videos
        const videosData = Array.isArray(videosRes.data?.data?.docs) ? videosRes.data.data.docs : 
                          Array.isArray(videosRes.data?.data) ? videosRes.data.data : [];
        const tweetsData = Array.isArray(tweetsRes.data?.data) ? tweetsRes.data.data : [];
        const playlistsData = Array.isArray(playlistsRes.data?.data) ? playlistsRes.data.data : [];

        setVideos(videosData);
        setTweets(tweetsData);
        setPlaylists(playlistsData);
        setCurrentUser(currentUserRes.data?.data || propCurrentUser);
        setHasLoaded(true);


      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userId, isOwnProfile, propCurrentUser, hasLoaded]);

  const handleTweetLike = async (tweet) => {
    try {
      await toggleTweetLike(tweet._id);
      // Refresh tweets after like
      const tweetsRes = await getUserTweets(userId);
      setTweets(tweetsRes.data?.data || []);
    } catch (err) {
      console.error('Error liking tweet:', err);
    }
  };

  const handleTweetUpdate = (tweet) => {
    // This would need to be implemented with the actual update functionality
    console.log('Update tweet:', tweet._id);
  };

  const handleTweetDelete = (tweet) => {
    // This would need to be implemented with the actual delete functionality
    console.log('Delete tweet:', tweet._id);
  };

  const handlePlaylistUpdate = (playlist) => {
    // This would need to be implemented with the actual update functionality
    console.log('Update playlist:', playlist._id);
  };

  const handlePlaylistDelete = (playlist) => {
    // This would need to be implemented with the actual delete functionality
    console.log('Delete playlist:', playlist._id);
  };

  const styles = {
    container: {
      maxWidth: 850,
      minWidth: 650,
      width: '100%',
      background: '#181818',
      borderRadius: 16,
      boxShadow: '0 4px 24px #0008',
      color: '#fff',
      marginTop: 24,
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #333',
      background: '#202020',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      alignItems: 'center',
      paddingRight: 16,
    },
    tab: {
      flex: 1,
      padding: '16px 24px',
      background: 'transparent',
      border: 'none',
      color: '#aaa',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
    },
    activeTab: {
      color: '#fff',
      fontWeight: 600,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      background: '#4fc3f7',
    },
    content: {
      padding: '24px 40px',
      minHeight: 400,
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      color: '#aaa',
    },
    error: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      color: '#ff6b6b',
    },
    empty: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      color: '#aaa',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      opacity: 0.7,
    },
    videosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px',
    },
    tweetsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    playlistsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '24px',
    },
    searchIcon: {
      marginLeft: 'auto',
      color: '#aaa',
      fontSize: 18,
      cursor: 'pointer',
      padding: 8,
      borderRadius: 4,
      transition: 'color 0.2s',
    },
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.loading}>
          <div>Loading content...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.error}>
          <div>{error}</div>
        </div>
      );
    }

    // If not loading and no error, but still no data, show a message
    if (!loading && !error && videos.length === 0 && tweets.length === 0 && playlists.length === 0) {
      return (
        <div style={styles.loading}>
          <div>No content available</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'videos':
        if (videos.length === 0) {
          return (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📹</div>
              <div style={styles.emptyText}>
                {isOwnProfile ? 'No videos yet' : 'No videos yet'}
              </div>
              <div style={styles.emptySubtext}>
                {isOwnProfile 
                  ? 'Upload your first video to get started'
                  : 'This channel hasn\'t uploaded any videos'
                }
              </div>
              {isOwnProfile && (
                <Link to="/publish" style={{ marginTop: 16, color: '#4fc3f7', textDecoration: 'none' }}>
                  Upload Video
                </Link>
              )}
            </div>
          );
        }
        return (
          <div style={styles.videosGrid}>
            {Array.isArray(videos) && videos.map((video) => (
              <VideoCard key={video._id} video={video} small={true} />
            ))}
          </div>
        );

      case 'tweets':
        if (tweets.length === 0) {
          return (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>🐦</div>
              <div style={styles.emptyText}>
                {isOwnProfile ? 'No posts yet' : 'No posts yet'}
              </div>
              <div style={styles.emptySubtext}>
                {isOwnProfile 
                  ? 'Share your thoughts with the community'
                  : 'This channel hasn\'t shared any posts'
                }
              </div>
            </div>
          );
        }
        return (
          <div style={styles.tweetsList}>
            {Array.isArray(tweets) && tweets.map((tweet) => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                currentUser={currentUser}
                onLike={handleTweetLike}
                onUpdate={handleTweetUpdate}
                onDelete={handleTweetDelete}
              />
            ))}
          </div>
        );

      case 'playlists':
        if (playlists.length === 0) {
          return (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📚</div>
              <div style={styles.emptyText}>
                {isOwnProfile ? 'No playlists yet' : 'No playlists yet'}
              </div>
              <div style={styles.emptySubtext}>
                {isOwnProfile 
                  ? 'Create playlists to organize your videos'
                  : 'This channel hasn\'t created any playlists'
                }
              </div>
            </div>
          );
        }
        return (
          <div style={styles.playlistsGrid}>
            {Array.isArray(playlists) && playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onUpdate={handlePlaylistUpdate}
                onDelete={handlePlaylistDelete}
                currentUser={currentUser}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render anything if no userId is provided
  if (!userId) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'videos' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('videos')}
        >
          Videos
          {activeTab === 'videos' && <div style={styles.activeIndicator} />}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'tweets' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('tweets')}
        >
          Posts
          {activeTab === 'tweets' && <div style={styles.activeIndicator} />}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'playlists' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
          {activeTab === 'playlists' && <div style={styles.activeIndicator} />}
        </button>
        <div style={styles.searchIcon} title="Search">
          🔍
        </div>
      </div>
      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentTabs; 