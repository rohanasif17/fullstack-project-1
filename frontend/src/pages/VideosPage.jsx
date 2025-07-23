import React, { useEffect, useState } from 'react';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { getVideos } from '../services/api';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await getVideos();
        const data = res.data?.data;
        // aggregatePaginate returns {docs: [], page, totalPages etc.}
        const videoDocs = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : [];
        setVideos(videoDocs);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch videos';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    // Show skeleton placeholders while videos are loading
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