import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistById, removeVideoFromPlaylist } from '../services/api';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';
import ErrorMessage from '../components/ErrorMessage';

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const response = await getPlaylistById(playlistId);
      const playlistData = response.data.data;
      setPlaylist(playlistData);
      
      // Set the first video as current video if available
      if (playlistData.videos && playlistData.videos.length > 0) {
        setCurrentVideo(playlistData.videos[0]);
      }
      setError('');
    } catch (err) {
      setError('Failed to load playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
  };

  // Show 'Play Next' button after video ends
  const handlePlayNext = () => {
    if (!playlist?.videos || !currentVideo) return;
    const idx = playlist.videos.findIndex(v => v._id === currentVideo._id);
    if (idx !== -1 && idx < playlist.videos.length - 1) {
      setCurrentVideo(playlist.videos[idx + 1]);
    }
  };

  // Check if there's a next video to show the prompt
  const hasNextVideo = playlist?.videos && currentVideo && 
    playlist.videos.findIndex(v => v._id === currentVideo._id) < playlist.videos.length - 1;

  const handleRemoveVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to remove this video from the playlist?')) {
      try {
        await removeVideoFromPlaylist(videoId, playlistId);
        
        // Update the playlist state
        setPlaylist(prev => ({
          ...prev,
          videos: prev.videos.filter(video => video._id !== videoId)
        }));

        // If the removed video was the current video, set the first remaining video as current
        if (currentVideo && currentVideo._id === videoId) {
          const remainingVideos = playlist.videos.filter(video => video._id !== videoId);
          if (remainingVideos.length > 0) {
            setCurrentVideo(remainingVideos[0]);
          } else {
            setCurrentVideo(null);
          }
        }
      } catch (err) {
        setError('Failed to remove video from playlist. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: '#fff'
      }}>
        Loading playlist...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        <ErrorMessage message={error} visible={true} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        <ErrorMessage message="Playlist not found" visible={true} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #333',
        backgroundColor: '#1e1e1e'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/playlists')}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Playlists
          </button>
          <h1 style={{ color: '#fff', margin: '0 0 10px 0' }}>{playlist.name}</h1>
          {playlist.description && (
            <p style={{ color: '#aaa', margin: '0 0 10px 0' }}>{playlist.description}</p>
          )}
          <p style={{ color: '#666', margin: 0 }}>
            {playlist.videos ? playlist.videos.length : 0} video{playlist.videos && playlist.videos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Main Video Player */}
        <div style={{ 
          flex: 1, 
          padding: '20px',
          minHeight: 'calc(100vh - 200px)'
        }}>
          {currentVideo ? (
            <>
              <VideoPlayer
                key={currentVideo._id}
                video={currentVideo}
                playNextPrompt={hasNextVideo ? 'Play Next' : undefined}
                onPlayNext={hasNextVideo ? handlePlayNext : undefined}
              />
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>
                📹
              </div>
              <h2>No videos in this playlist</h2>
              <p style={{ color: '#aaa' }}>
                Add some videos to start watching
              </p>
            </div>
          )}
        </div>

        {/* Sidebar with playlist videos */}
        <div style={{ 
          width: '350px', 
          padding: '20px',
          borderLeft: '1px solid #333',
          backgroundColor: '#1a1a1a',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '20px' }}>Playlist Videos</h3>
          {playlist.videos && playlist.videos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {playlist.videos.map((video, index) => (
                <div key={video._id} style={{ position: 'relative' }}>
                  <div 
                    style={{ 
                      cursor: 'pointer',
                      opacity: currentVideo && currentVideo._id === video._id ? 0.7 : 1
                    }}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <VideoCard video={video} small={true} active={currentVideo && currentVideo._id === video._id} disableNavigation={true} />
                  </div>
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => e.target.style.opacity = 0}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              padding: '40px 20px'
            }}>
              <p>No videos in this playlist yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailPage; 