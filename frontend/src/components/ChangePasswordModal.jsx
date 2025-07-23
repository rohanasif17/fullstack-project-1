import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import api from '../services/api';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const ChangePasswordModal = () => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  // Hover state for trigger button
  const [isHovered, setIsHovered] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleClose = () => {
    setShow(false);
    // reset states when modal closes
    setFormData({ oldPassword: '', newPassword: '' });
    setErrorMsg('');
    setShowError(false);
    setSuccessMsg('');
    setShowSuccess(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
  };
  const handleShow = () => setShow(true);

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

    try {
      // Prevent using the same password
      if (formData.oldPassword === formData.newPassword) {
        setErrorMsg('New password must be different from the old password.');
        setShowError(true);
        return;
      }

      await api.post('/users/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      // Show success message then auto-close
      setSuccessMsg('Password changed successfully!');
      setShowSuccess(true);
      setErrorMsg('');
      setShowError(false);
      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (error) {
      // Capture error message coming from backend else set generic message
      const message =
        error?.response?.data?.message || 'Failed to change password. Please try again.';
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
        Change Password
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#1e1e1e', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff' }}>Set New Password</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="oldPasswordInput">
              <Form.Label>Old Password</Form.Label>
              <div style={{ position: 'relative' }}>
                <Form.Control
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Enter old password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  autoFocus
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#ccc',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showOldPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPasswordInput">
              <Form.Label>New Password</Form.Label>
              <div style={{ position: 'relative' }}>
                <Form.Control
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#ccc',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Form.Group>
            {/* Messages */}
            <ErrorMessage message={errorMsg} visible={showError} />
            <SuccessMessage message={successMsg} visible={showSuccess} />
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1e1e1e', borderTop: 'none' }}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {/* Submit button triggers handleSubmit via form */}
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
            Save New Password
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangePasswordModal; 