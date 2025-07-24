// pages/LoginPage.js
import React from 'react';
import LoginForm from '../components/LoginForm.jsx';

const LoginPage = ({ setIsAuthenticated }) => {
  return (
    <div>
      <LoginForm setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default LoginPage;
