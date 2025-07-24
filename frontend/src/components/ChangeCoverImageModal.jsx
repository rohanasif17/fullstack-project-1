import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import api, { getCurrentUser } from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import { coverImageSample } from '../../public/imageUrl';

const DEFAULT_COVER =  coverImageSample;

const ChangeCoverImageModal = ({ show, onHide }) => {
  const [currentCover, setCurrentCover] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setErrorMsg('');
    setShowError(false);
    setSuccessMsg('');
    setShowSuccess(false);
    if (onHide) onHide();
  };

  const populateCover = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      const user = res?.data?.data || {};
      setCurrentCover(user?.coverImage?.url || '');
    } catch (err) {
      setErrorMsg('Failed to fetch cover image.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

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

    try {
      const formData = new FormData();
      formData.append('coverImage', selectedFile);
      await api.patch('/users/coverImage-update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Cover image updated successfully!');
      setShowSuccess(true);
      await populateCover();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const message =
        err?.message || 'Failed to update cover image. Please try again.';
      setErrorMsg(message);
      setShowError(true);
    }
  };

  const displayImage = previewUrl || currentCover || DEFAULT_COVER;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff' }}>Update Cover Image</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
          {loading ? (
            <p style={{ color: '#ccc' }}>Loading...</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="currentCoverPreview">
                <Form.Label>Current Cover</Form.Label>
                <div style={{ textAlign: 'center' }}>
                  <Image
                    src={displayImage}
                    thumbnail
                    style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="newCoverInput">
                <Form.Label>Select New Cover Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              </Form.Group>

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

export default ChangeCoverImageModal; 