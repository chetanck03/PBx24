import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleLogin = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Create a mock token for testing
    const mockToken = 'test-token-' + Date.now();
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify({
      email: email,
      name: email.split('@')[0],
      role: 'buyer'
    }));
    
    alert('Logged in successfully! (Test Mode)');
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Test Login</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Temporary login for testing. Fix Google OAuth in Google Cloud Console.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (for testing)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Login (Test Mode)
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>To fix Google OAuth:</strong><br/>
            1. Go to Google Cloud Console<br/>
            2. Add http://localhost:5173 to Authorized JavaScript origins<br/>
            3. Save and try again
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
