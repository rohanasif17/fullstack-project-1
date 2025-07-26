import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getCurrentUserPlaylists, addVideoToPlaylist } from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const AddToPlaylistModal = ({ show, onHide, video, onVideoAdded }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUserPlaylists();
      setPlaylists(response.data.data);
      setError('');
    } catch (err) {
      console.error('AddToPlaylistModal: Error fetching playlists:', err);
      setError(`Failed to load playlists: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchPlaylists();
    }
  }, [show]);

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    setShowSuccess(false);
    setAddingToPlaylist(null);
    if (onHide) onHide();
  };

  const handleAddToPlaylist = async (playlist) => {
    try {
      setAddingToPlaylist(playlist._id);
      await addVideoToPlaylist(video._id, playlist._id);
      
      setSuccessMsg(`Added to "${playlist.name}" successfully!`);
      setShowSuccess(true);
      setError('');
      
      if (onVideoAdded) {
        onVideoAdded(playlist);
      }
      
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to add video to playlist. Please try again.';
      setError(message);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const isVideoInPlaylist = (playlist) => {
    return playlist.videos && playlist.videos.some(v => v._id === video._id);
  };

  if (!video) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
        <Modal.Title style={{ color: '#fff' }}>Add to Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h6 style={{ color: '#ccc', marginBottom: '10px' }}>Video:</h6>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={video.thumbnail} 
              alt={video.title}
              style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{video.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                {video.owner?.fullName || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h6 style={{ color: '#ccc', marginBottom: '15px' }}>Your Playlists:</h6>
          
          <ErrorMessage message={error} visible={!!error} />
          <SuccessMessage message={successMsg} visible={showSuccess} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
              Loading playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
              <p>No playlists found</p>
              <p style={{ fontSize: '12px' }}>Create a playlist first to add videos</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {playlists.map(playlist => {
                const isInPlaylist = isVideoInPlaylist(playlist);
                const isAdding = addingToPlaylist === playlist._id;
                
                return (
                  <div 
                    key={playlist._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '8px',
                      border: isInPlaylist ? '1px solid #4CAF50' : '1px solid transparent'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '500' }}>{playlist.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                        {playlist.videos ? playlist.videos.length : 0} video{playlist.videos && playlist.videos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {isInPlaylist ? (
                      <span style={{ color: '#4CAF50', fontSize: '14px', fontWeight: '500' }}>
                        ✓ Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToPlaylist(playlist)}
                        disabled={isAdding}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: isAdding ? '#666' : '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#000',
                          fontWeight: 'bold',
                          cursor: isAdding ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {isAdding ? 'Adding...' : 'Add'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddToPlaylistModal; 