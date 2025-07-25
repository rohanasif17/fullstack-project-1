import React, { useEffect, useState } from 'react';
import { getUserHistory } from '../services/api';
import VideoCard from '../components/VideoCard';

const HistoryPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getUserHistory()
      .then(res => setVideos(res.data?.data || []))
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h2>Watch History</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && videos.length === 0 && <div>No history found.</div>}
      {!loading && !error && videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

export default HistoryPage; 