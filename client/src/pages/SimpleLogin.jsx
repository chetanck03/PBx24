// This file is deprecated and redirects to SignIn
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleLogin = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the main sign in page
    navigate('/auth/signin', { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
};

export default SimpleLogin;
