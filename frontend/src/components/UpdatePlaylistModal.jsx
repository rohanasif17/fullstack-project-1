import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { updatePlaylist } from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const UpdatePlaylistModal = ({ show, onHide, playlist, onPlaylistUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when playlist prop changes
  useEffect(() => {
    if (playlist) {
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
      });
    }
  }, [playlist]);

  const handleClose = () => {
    // reset states when modal closes
    setErrorMsg('');
    setShowError(false);
    setSuccessMsg('');
    setShowSuccess(false);
    setIsSubmitting(false);
    if (onHide) onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-hide error after a brief period (2s)
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await updatePlaylist(playlist._id, formData.name, formData.description);
      
      // Show success message then auto-close
      setSuccessMsg('Playlist updated successfully!');
      setShowSuccess(true);
      setErrorMsg('');
      setShowError(false);
      
      // Call the callback to refresh playlists
      if (onPlaylistUpdated) {
        onPlaylistUpdated(response.data.data);
      }
      
      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (error) {
      // Capture error message coming from backend else set generic message
      const message =
        error?.response?.data?.message || 'Failed to update playlist. Please try again.';
      setErrorMsg(message);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!playlist) return null;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff' }}>Update Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="playlistNameInput">
              <Form.Label>Playlist Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter playlist name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="playlistDescriptionInput">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter playlist description (optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
              />
            </Form.Group>
            
            {/* Messages */}
            <ErrorMessage message={errorMsg} visible={showError} />
            <SuccessMessage message={successMsg} visible={showSuccess} />
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1e1e1e', borderTop: 'none' }}>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            style={{
              padding: '0.4rem 1.25rem',
              backgroundColor: '#fff',
              border: '2px solid #111',
              borderRadius: '4px',
              color: '#111',
              fontWeight: 'bold',
              marginLeft: '8px',
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update Playlist'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdatePlaylistModal; 