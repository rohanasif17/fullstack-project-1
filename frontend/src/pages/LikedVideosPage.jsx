import React, { useEffect, useState } from 'react';
import VideoCard from '../components/VideoCard';
import { getLikedVideos } from '../services/api';

const LikedVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const res = await getLikedVideos();
        const data = res.data?.data;
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch liked videos');
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>Liked Videos</h2>
      {videos.length === 0 ? (
        <div>No liked videos yet.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 24,
          padding: 24,
        }}>
          {videos.map((video) => (
            <VideoCard key={video.likedVideo._id} video={video.likedVideo} />
          ))}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 40, fontSize: 18, color: '#888' }}>
        That’s the end! Found some gems? 💎
      </div>
    </div>
  );
};

export default LikedVideosPage; 