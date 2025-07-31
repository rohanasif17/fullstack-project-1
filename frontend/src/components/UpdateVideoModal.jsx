import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import { updateVideo } from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const UpdateVideoModal = ({ show, onHide, video, onVideoUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    // Reset transient UI state but keep latest form values on close
    setErrorMsg('');
    setShowError(false);
    setSuccessMsg('');
    setShowSuccess(false);
    setSelectedThumbnail(null);
    setThumbnailPreview('');
    if (onHide) onHide();
  };

  const populateVideoDetails = () => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
      });
      setThumbnailPreview(video.thumbnail || '');
    }
  };

  // Load video details when modal opens
  useEffect(() => {
    if (show && video) {
      populateVideoDetails();
    }
  }, [show, video]);

  // Auto-hide error after 2 seconds
  useEffect(() => {
    if (showError) {
      const t = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedThumbnail(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      
      if (selectedThumbnail) {
        formDataToSend.append('thumbnail', selectedThumbnail);
      }

      await updateVideo(video._id, formDataToSend);

      setSuccessMsg('Video updated successfully!');
      setShowSuccess(true);
      
      // Call the callback to refresh the video list
      if (onVideoUpdated) {
        onVideoUpdated();
      }
      
      // Hide modal shortly after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Failed to update video. Please try again.';
      setErrorMsg(message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff' }}>Update Video</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
          {loading ? (
            <p style={{ color: '#ccc' }}>Updating video...</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="titleInput">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter video title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="descriptionInput">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter video description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="thumbnailInput">
                <Form.Label>Thumbnail</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                <Form.Text className="text-muted">
                  Leave empty to keep the current thumbnail
                </Form.Text>
              </Form.Group>

              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <Form.Group className="mb-3">
                  <Form.Label>Thumbnail Preview</Form.Label>
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={thumbnailPreview}
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '120px', 
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                </Form.Group>
              )}

              {/* Messages */}
              <ErrorMessage message={errorMsg} visible={showError} />
              <SuccessMessage message={successMsg} visible={showSuccess} />
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1e1e1e', borderTop: 'none' }}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
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
            {loading ? 'Updating...' : 'Update Video'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateVideoModal; 