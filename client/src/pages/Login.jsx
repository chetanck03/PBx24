import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import { ArrowLeft, Eye, EyeOff, Smartphone } from 'lucide-react';
import config from '../config/env.js';

const Login = () => {
  const { isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/marketplace');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        updateUser(data.data.user);
        navigate('/marketplace');
      } else {
        setError(data.error?.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 h-full py-4">
        {/* Left Side - Phone Mockup */}
        <div className="hidden lg:flex justify-center items-center relative">
          <div className="relative">
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              {/* Phone Frame */}
              <div className="w-[300px] h-[480px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[40px] shadow-2xl border-5 border-gray-700 relative overflow-hidden">
                {/* Phone Screen */}
                <div className="absolute inset-2 bg-gradient-to-b from-gray-900 to-black rounded-[35px] overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 pt-2 text-white text-xs">
                    <span>9:15 AM</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-3 border border-white rounded-sm"></div>
                      <div className="w-1 h-3 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <button className="flex items-center gap-1 text-green-400">
                        <ArrowLeft className="w-3 h-3" />
                        <span className="text-xs">Back to home</span>
                      </button>
                      
                    </div>

                    <div className="mb-4">
                      <h2 className="text-white text-xl font-bold mb-1">Welcome back</h2>
                      <p className="text-gray-400 text-xs">Sign in to your PhoneBid account</p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="bg-gray-800/50 rounded-lg p-2.5 border border-gray-700">
                        <input 
                          type="text" 
                          placeholder="Email address" 
                          className="bg-transparent text-white text-xs w-full outline-none"
                          disabled
                        />
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2.5 border border-gray-700 flex justify-between items-center">
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="bg-transparent text-white text-xs w-full outline-none"
                          disabled
                        />
                        <span className="text-gray-500 text-xs">Show</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-1 text-gray-400 text-xs">
                          <div className="w-3 h-3 border border-gray-600 rounded"></div>
                          Remember me
                        </label>
                        <span className="text-green-400 text-xs">Forgot password?</span>
                      </div>

                      <button className="w-full bg-green-500 text-white py-2 rounded-full font-semibold text-xs">
                        Sign In
                      </button>

                      <button className="w-full bg-white text-gray-700 py-2 rounded-full font-semibold flex items-center justify-center gap-2 text-xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </button>

                      <p className="text-center text-gray-400 text-xs">
                        Don't have an account? <span className="text-green-400">Sign up free</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl"></div>
              </div>

              {/* Hand illustration effect */}
              <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-30 blur-2xl"></div>
              <div className="absolute -bottom-20 -right-10 w-40 h-40 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-30 blur-2xl"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Actual Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 flex flex-col justify-center">
          {/* Back to Home - Top */}
          <div className="mb-2">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-300 transition flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5">
             
              
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-gray-400 text-sm">Sign in to your PhoneBid account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-gray-900"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-green-400 hover:text-green-300 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-lime-400 text-black py-2.5 rounded-lg font-semibold hover:from-green-400 hover:to-lime-300 transition-all shadow-lg hover:shadow-lime-400/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In - Using the actual GoogleAuthButton component */}
              <div className="google-auth-wrapper flex justify-center">
                <GoogleAuthButton />
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-400 mt-4">
                Don't have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="text-lime-400 hover:text-lime-300 font-semibold transition"
                >
                  Sign up for free
                </Link>
              </p>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-3">
              By signing in, you agree to our{' '}
              <span className="text-gray-400 hover:text-gray-300 cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-gray-400 hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
