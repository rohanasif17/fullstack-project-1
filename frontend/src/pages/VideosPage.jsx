import React, { useEffect, useState, useRef, useCallback } from 'react';
import VideoCard from '../components/VideoCard';
import CategoryFilter from '../components/CategoryFilter';
import { getVideos, getCurrentUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MIN_CARD_WIDTH = 260;
const CARD_GAP = 24;
const CARD_ASPECT_RATIO = 16 / 9;
const CARD_INFO_HEIGHT = 80; // Approximate height for info section below thumbnail

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const fetchVideos = useCallback(async (category = 'All') => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {};
      if (category !== 'All') {
        params.category = category;
      }

      // Fetch videos and current user in parallel
      const [videoRes, userRes] = await Promise.allSettled([
        getVideos(params),
        getCurrentUser(),
      ]);

      // Extract videos
      let videoDocs = [];
      if (videoRes.status === 'fulfilled') {
        const data = videoRes.value.data?.data;
        videoDocs = Array.isArray(data?.docs)
          ? data.docs
          : Array.isArray(data)
          ? data
          : [];
      }

      // Extract user if available
      let loggedInUser = null;
      if (userRes.status === 'fulfilled') {
        loggedInUser = userRes.value.data?.data || null;
        setCurrentUser(loggedInUser);
      } else {
        // If getCurrentUser failed, redirect to /
        navigate('/', { replace: true });
        return;
      }

      // If user is logged in, filter out their own videos
      if (loggedInUser?._id) {
        videoDocs = videoDocs.filter(
          (v) => v.owner?.[0]?._id !== loggedInUser._id
        );
      }

      setVideos(videoDocs);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch videos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchVideos(category);
  };

  useEffect(() => {
    fetchVideos('All');
  }, [fetchVideos]);

  if (loading) {
    // Show nothing or a simple loading message while videos are loading
    return (
      <div style={styles.center}>Loading...</div>
    );
  }
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.pageContainer}>
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {videos.length === 0 ? (
        <div style={styles.noVideosContainer}>
          <div style={styles.noVideosMessage}>
            {selectedCategory === 'All' 
              ? 'No videos found.' 
              : `No videos found in the "${selectedCategory}" category.`
            }
          </div>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: '#0f0f0f',
    minHeight: '100vh',
  },
  body: {
    backgroundColor: '#0f0f0f'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 24,
    padding: 24,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    fontSize: 18,
    color: '#555',
  },
  noVideosContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    padding: 24,
  },
  noVideosMessage: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
};

export default VideosPage; 