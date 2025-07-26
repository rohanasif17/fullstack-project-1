import React, { useState, useEffect } from 'react';
import { getCurrentUserPlaylists, deletePlaylist } from '../services/api';
import PlaylistCard from '../components/PlaylistCard';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import UpdatePlaylistModal from '../components/UpdatePlaylistModal';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUserPlaylists();
      setPlaylists(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError(`Failed to load playlists: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = (newPlaylist) => {
    setPlaylists(prev => [newPlaylist, ...prev]);
    setSuccessMsg('Playlist created successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUpdatePlaylist = (updatedPlaylist) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist._id === updatedPlaylist._id ? updatedPlaylist : playlist
      )
    );
    setSuccessMsg('Playlist updated successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeletePlaylist = async (playlist) => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        await deletePlaylist(playlist._id);
        setPlaylists(prev => prev.filter(p => p._id !== playlist._id));
        setSuccessMsg('Playlist deleted successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        setError('Failed to delete playlist. Please try again.');
      }
    }
  };

  const handleUpdateClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowUpdateModal(true);
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
        Loading playlists...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px' 
        }}>
          <h1 style={{ color: '#fff', margin: 0 }}>Your Playlists</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Create Playlist
          </button>
        </div>

        <ErrorMessage message={error} visible={!!error} />
        <SuccessMessage message={successMsg} visible={showSuccess} />

        {playlists.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#fff'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              opacity: 0.5
            }}>
              📁
            </div>
            <h2 style={{ marginBottom: '10px' }}>No playlists yet</h2>
            <p style={{ 
              marginBottom: '30px', 
              color: '#aaa',
              fontSize: '16px'
            }}>
              Create your first playlist to organize your favorite videos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {playlists.map(playlist => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onUpdate={handleUpdateClick}
                onDelete={handleDeletePlaylist}
              />
            ))}
          </div>
        )}
      </div>

      <CreatePlaylistModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onPlaylistCreated={handleCreatePlaylist}
      />

      <UpdatePlaylistModal
        show={showUpdateModal}
        onHide={() => {
          setShowUpdateModal(false);
          setSelectedPlaylist(null);
        }}
        playlist={selectedPlaylist}
        onPlaylistUpdated={handleUpdatePlaylist}
      />
    </div>
  );
};

export default PlaylistsPage; 