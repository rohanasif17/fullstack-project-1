import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import api, { getCurrentUser } from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const UpdateDetailsModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
  });
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
    if (onHide) onHide();
  };

  const populateUserDetails = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      const user = res?.data?.data || {};
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
      });
    } catch (err) {
      setErrorMsg('Failed to fetch user data.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setShow(true);
    populateUserDetails();
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/users/update-details', {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
      });
      setSuccessMsg('Details updated successfully!');
      setShowSuccess(true);
      // Hide modal shortly after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Failed to update details. Please try again.';
      setErrorMsg(message);
      setShowError(true);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff' }}>Update Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
          {loading ? (
            <p style={{ color: '#ccc' }}>Loading...</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="fullNameInput">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="usernameInput">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="emailInput">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
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

export default UpdateDetailsModal; 