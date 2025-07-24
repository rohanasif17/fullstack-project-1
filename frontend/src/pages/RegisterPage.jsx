import React from 'react';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = ({ setIsAuthenticated }) => {
  return <RegisterForm setIsAuthenticated={setIsAuthenticated} />;
};

export default RegisterPage; 