import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Eye, EyeOff, Smartphone, Upload, X } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    governmentIdProof: '', 
    governmentIdType: '' 
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, governmentIdProof: reader.result });
        setIdProofPreview(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.governmentIdProof) {
      setError('Government ID proof is required');
      return false;
    }
    if (!formData.governmentIdType) {
      setError('Please select the type of government ID');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/v2/auth/signup/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name })
      });

      const data = await response.json();

      if (data.success) {
        setStep(2);
        setSuccess('OTP sent to your email!');
        startResendTimer();
      } else {
        setError(data.error.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/v2/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otpString,
          name: formData.name,
          password: formData.password,
          governmentIdProof: formData.governmentIdProof,
          governmentIdType: formData.governmentIdType
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        updateUser(data.data.user);
        setSuccess('Account created successfully!');
        setTimeout(() => navigate('/marketplace'), 1500);
      } else {
        setError(data.error.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v2/auth/signup/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('New OTP sent!');
        startResendTimer();
      }
    } catch (error) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl w-full mx-auto relative z-10">
        {/* Back to Home - Top */}
        <div className="mb-4">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-300 transition flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-lime-400 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PhoneBid</h1>
                <p className="text-xs text-gray-400">Auction Platform</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </h2>
            <p className="text-gray-400">
              {step === 1 
                ? 'Join PhoneBid and start trading anonymously'
                : `We sent a 6-digit code to ${formData.email}`
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-lime-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-lime-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-lime-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition pr-12"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-lime-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition pr-12"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ID Type and Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Government ID <span className="text-lime-400">*</span>
                  </label>
                  <div className="relative">
                    {idProofPreview ? (
                      <div className="relative bg-gray-800/50 border-2 border-lime-500 rounded-xl p-4">
                        <img 
                          src={idProofPreview} 
                          alt="ID Preview" 
                          className="w-full h-32 object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, governmentIdProof: '' });
                            setIdProofPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 bg-gray-800/50 border-2 border-dashed border-lime-500 rounded-xl cursor-pointer hover:bg-gray-800/70 transition">
                        <Upload className="w-10 h-10 text-lime-400 mb-2" />
                        <span className="text-sm text-gray-300 mb-1">Upload a file or drag</span>
                        <span className="text-xs text-gray-500">and drop</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* ID Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select ID Type <span className="text-lime-400">*</span>
                  </label>
                  <select
                    name="governmentIdType"
                    value={formData.governmentIdType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-lime-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
                    required
                  >
                    <option value="" className="bg-gray-800">Select ID Type</option>
                    <option value="Aadhaar" className="bg-gray-800">Aadhaar Card</option>
                    <option value="PAN" className="bg-gray-800">PAN Card</option>
                    <option value="Passport" className="bg-gray-800">Passport</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG, PDF up to 55MB
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Please upload a clear photo of government-issued ID...
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-lime-500 bg-gray-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-gray-900"
                  required
                />
                <label className="text-sm text-gray-400">
                  I agree to the Terms and Privacy Policy
                </label>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-lime-400 text-black py-3.5 rounded-full font-bold text-lg hover:from-green-400 hover:to-lime-300 transition-all shadow-lg hover:shadow-lime-400/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-lime-400 hover:text-lime-300 font-semibold transition">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                  Enter the 6-digit code
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold bg-gray-800/50 border-2 border-lime-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-lime-400 hover:text-lime-300 font-semibold disabled:text-gray-600 disabled:cursor-not-allowed transition"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-lime-400 text-black py-3.5 rounded-full font-bold text-lg hover:from-green-400 hover:to-lime-300 transition-all shadow-lg hover:shadow-lime-400/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Verifying...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300 transition flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change email address
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
