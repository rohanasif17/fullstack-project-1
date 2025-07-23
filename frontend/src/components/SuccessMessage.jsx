import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';

// Base style reused from ErrorMessage for consistency
const messageBaseStyle = {
  fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
  borderRadius: '8px',
  padding: '8px',
  marginTop: '8px',
  transition: 'opacity 0.5s ease-in-out',
  minHeight: '32px',
  fontSize: '14px',
  pointerEvents: 'none',
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  zIndex: 2,
  textAlign: 'center',
};

/**
 * Displays a transient success message that fades after 2 seconds.
 * Accepts same props as ErrorMessage: `message`, `visible`, and optional `onHide` callback.
 */
const SuccessMessage = ({ message = '', visible = false, onHide }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible && message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onHide) onHide();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, message, onHide]);

  const style = {
    ...messageBaseStyle,
    opacity: show ? 1 : 0,
  };

  return (
    <div style={style}>
      <Alert variant="success" style={{ backgroundColor: '#051b11', color: '#75b798', marginBottom: 0 }}>
        {message}
      </Alert>
    </div>
  );
};

export default SuccessMessage; 