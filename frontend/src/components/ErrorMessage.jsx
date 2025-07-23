import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';

const errorDivBaseStyle = {
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

const ErrorMessage = ({ message = '', visible = false, onHide }) => {
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
    ...errorDivBaseStyle,
    opacity: show ? 1 : 0,
  };

  return (
    <div style={style}>
      <Alert variant='danger' style={{ backgroundColor: '#2c0b0e', color: '#ea868e', marginBottom: 0 }}>
        {message}
      </Alert>
    </div>
  );
};

export default ErrorMessage; 