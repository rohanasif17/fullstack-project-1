import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import api, { getCurrentUser } from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const ChangeAvatarModal = () => {
  const [show, setShow] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = () => {
    setShow(false);
    // Reset transient UI state but keep latest avatar on close
    setSelectedFile(null);
    setPreviewUrl('');
    setErrorMsg('');
    setShowError(false);
    setSuccessMsg('');
    setShowSuccess(false);
  };

  const populateAvatar = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      const user = res?.data?.data || {};
      setCurrentAvatar(user?.avatar?.url || '');
    } catch (err) {
      setErrorMsg('Failed to fetch user avatar.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setShow(true);
    populateAvatar();
  };

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  // Auto-hide error after 2 seconds
  useEffect(() => {
    if (showError) {
      const t = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showError]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select an image to upload.');
      setShowError(true);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      await api.patch('/users/avatar-update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Avatar updated successfully!');
      setShowSuccess(true);
      // Refresh current avatar and close modal shortly after success
      await populateAvatar();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Failed to update avatar. Please try again.';
      setErrorMsg(message);
      setShowError(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleShow}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? '#111' : '#fff',
          color: isHovered ? '#fff' : '#111',
          border: isHovered ? '3px solid #fff' : '2px solid #111',
          fontWeight: 'bold',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Change Avatar
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff' }}>Update Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
          {loading ? (
            <p style={{ color: '#ccc' }}>Loading...</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="currentAvatarPreview">
                <Form.Label>Current Avatar</Form.Label>
                <div style={{ textAlign: 'center' }}>
                  {currentAvatar ? (
                    <Image
                      src={previewUrl || currentAvatar}
                      roundedCircle
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  ) : (
                    <p style={{ color: '#ccc' }}>No avatar set.</p>
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="newAvatarInput">
                <Form.Label>Select New Avatar</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              </Form.Group>

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
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangeAvatarModal; 