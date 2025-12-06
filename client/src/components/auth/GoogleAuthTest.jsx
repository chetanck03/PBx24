import { useEffect, useState } from 'react';
import config from '../../config/env.js';

const GoogleAuthTest = () => {
  const [status, setStatus] = useState('Checking...');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    setClientId(config.GOOGLE_CLIENT_ID);
    
    if (!config.GOOGLE_CLIENT_ID) {
      setStatus('Google Client ID is missing from environment variables');
      return;
    }

    // Test if Google OAuth script loads
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        setStatus('Google OAuth script loaded successfully');
        
        // Test initialization
        try {
          window.google.accounts.id.initialize({
            client_id: config.GOOGLE_CLIENT_ID,
            callback: () => {}, // dummy callback
          });
          setStatus('Google OAuth initialized successfully');
        } catch (error) {
          setStatus(`Google OAuth initialization failed: ${error.message}`);
        }
      } else {
        setStatus('Google OAuth script loaded but window.google is not available');
      }
    };
    
    script.onerror = () => {
      setStatus('Failed to load Google OAuth script');
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="p-4 bg-gray-50 border rounded-md">
      <h3 className="font-semibold mb-2">Google OAuth Configuration Test</h3>
      <p className="text-sm mb-2"><strong>Status:</strong> {status}</p>
      <p className="text-sm mb-2"><strong>Client ID:</strong> {clientId || 'Not configured'}</p>
      <p className="text-xs text-gray-600">
        If you see errors, check your Google Cloud Console configuration.
      </p>
    </div>
  );
};

export default GoogleAuthTest;