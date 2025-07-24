import React, { useState, useEffect, useRef } from 'react';

const CommentItem = ({ comment, index, onToggleLike, currentUser, onUpdateComment, onDeleteComment }) => {
  if (!comment) return null;

  const isOwner = currentUser?._id && comment?.owner?._id === currentUser._id;
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  // Track hover state to only show the menu button (⋮) on hover
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const menuRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  const handleLike = () => onToggleLike(comment._id, index);

  const startEdit = () => {
    setShowActions(false);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== comment.content) {
      onUpdateComment(comment._id, trimmed, index);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditContent(comment.content);
    setEditing(false);
  };

  const handleDelete = () => {
    setShowActions(false);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteComment(comment._id, index);
    setShowConfirm(false);
  };

  const toggleMenu = () => setShowActions((prev) => !prev);

  return (
    <div
      style={styles.commentRow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={comment.owner?.avatar?.url || ''}
        alt="avatar"
        style={styles.commentAvatar}
      />
      <div style={styles.commentBody}>
        <span style={styles.commentOwner}>{comment.owner?.username || 'User'}</span>

        {editing ? (
          <>
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={styles.editInput}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                style={{
                  ...styles.saveBtn,
                  ...(editContent.trim() === comment.content.trim() ? styles.saveBtnDisabled : {})
                }}
                onClick={saveEdit}
                disabled={editContent.trim() === comment.content.trim()}
              >
                Save
              </button>
              <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p style={styles.commentText}>{comment.content}</p>
            <button onClick={handleLike} style={styles.commentLikeBtn}>
              {comment.isLiked ? '👍' : '👍🏻'} &nbsp;{comment.likesCount || 0}
            </button>
          </>
        )}
      </div>
      {isOwner && (isHovered || showActions) && (
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div onClick={toggleMenu} style={styles.menuWrapper}>
            <span style={styles.menuBtn}>⋮</span>
          </div>
          {showActions && (
            <div style={styles.dropdown}>
              <button style={styles.dropdownItem} onClick={startEdit}>Update</button>
              <button style={styles.dropdownItem} onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      )}

      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p style={{ marginBottom: 16 }}>Are you sure you want to delete this comment?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={styles.cancelBtn} onClick={() => setShowConfirm(false)}>Cancel</button>
              <button style={styles.deleteBtn} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  commentRow: {
    display: 'flex',
    gap: 12,
    marginTop: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentBody: {
    flex: 1,
  },
  commentOwner: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    margin: '4px 0',
  },
  commentLikeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#3ea6ff',
  },
  menuBtn: {
    color: '#fff',
    fontSize: 18,
  },
  menuWrapper: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 24,
    backgroundColor: '#333',
    borderRadius: 4,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    zIndex: 10,
    minWidth: 100,
  },
  dropdownItem: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    width: '100%',
    padding: '8px 12px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  editInput: {
    width: '100%',
    padding: 6,
    borderRadius: 4,
    border: '1px solid #444',
    backgroundColor: '#111',
    color: '#fff',
  },
  saveBtn: {
    padding: '0.35rem 0.8rem',
    backgroundColor: '#111',
    border: '2px solid #fff',
    borderRadius: 4,
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    border: '2px solid #888',
    color: '#aaa',
    backgroundColor: '#222',
  },
  cancelBtn: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: '1px solid #666',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
  },
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
  deleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#d32f2f',
    border: 'none',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

export default CommentItem; 