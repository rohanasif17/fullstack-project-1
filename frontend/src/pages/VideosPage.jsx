import React, { useEffect, useState, useRef } from 'react';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
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
  const navigate = useNavigate();
  // Removed gridRef and skeletonCount state

  // Removed dynamic skeleton count effect

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch videos and current user in parallel
        const [videoRes, userRes] = await Promise.allSettled([
          getVideos(),
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
    };

    fetchVideos();
  }, [navigate]);

  if (loading) {
    // Show a fixed number of skeleton placeholders while videos are loading
    return (
      <div style={styles.gridContainer}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <VideoCardSkeleton key={idx} />
        ))}
      </div>
    );
  }
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.gridContainer}>
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

const styles = {
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
};

export default VideosPage; 