import React from 'react';

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalBox: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 6,
    width: '90%',
    maxWidth: 400,
  },
  cancelBtn: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: '1px solid #666',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#d32f2f',
    border: 'none',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

const ConfirmDeleteModal = ({ show, onCancel, onConfirm, message = 'Are you sure you want to delete?', confirmLabel = 'Delete', cancelLabel = 'Cancel' }) => {
  if (!show) return null;
  return (
    <div style={styles.modalOverlay} tabIndex={0}>
      <div style={styles.modalBox}>
        <p style={{ marginBottom: 16 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button style={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          <button style={styles.deleteBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;