
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { reelAPI } from './services/api';
import { X, Upload, Loader2 } from 'lucide-react';
import Logo from './components/common/Logo';

// Critical pages - load immediately
import ProfessionalHome from './pages/ProfessionalHome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EnhancedMarketplace from './pages/EnhancedMarketplace';

// Lazy load non-critical pages
const Home = lazy(() => import('./pages/Home'));
const SimpleLogin = lazy(() => import('./pages/SimpleLogin'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const PhoneDetail = lazy(() => import('./pages/PhoneDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const CreatePhoneListing = lazy(() => import('./pages/CreatePhoneListing'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Complaints = lazy(() => import('./pages/Complaints'));
const Reels = lazy(() => import('./pages/Reels'));
const Explore = lazy(() => import('./pages/Explore'));
const Chatbot = lazy(() => import('./components/chatbot/Chatbot'));

// Static Pages - lazy load
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Security = lazy(() => import('./pages/Security'));
const Privacy = lazy(() => import('./pages/Privacy'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <Loader2 className="w-12 h-12 text-[#c4ff0d] animate-spin" />
  </div>
);

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [reelDescription, setReelDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Pages that should not show the navbar (only auth pages)
  const noNavbarPages = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];
  const showNavbar = !noNavbarPages.includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileDropdown(false);
  };

  // Upload Reel Functions
  const handleUploadClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to upload reels');
      navigate('/auth/signin');
      return;
    }
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB');
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 30) {
        toast.error('Video must be 30 seconds or less');
        return;
      }
      setVideoDuration(video.duration);
      setSelectedVideo(file);
    };
    video.src = URL.createObjectURL(file);
  };

  const handleUploadReel = async () => {
    if (!selectedVideo) {
      toast.error('Please select a video');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', selectedVideo);
      formData.append('description', reelDescription);
      formData.append('duration', videoDuration);

      await reelAPI.uploadReel(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      toast.success('Reel uploaded successfully!');
      closeUploadModal();
      if (location.pathname === '/reels') {
        window.location.reload();
      } else {
        navigate('/reels');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to upload reel');
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    if (!uploading) {
      setShowUploadModal(false);
      setSelectedVideo(null);
      setReelDescription('');
      setUploadProgress(0);
      setVideoDuration(0);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {showNavbar && (
        <nav className="bg-[#0a0a0a] sticky top-0 z-50 py-2 md:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navbar with rounded border container */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl md:rounded-2xl px-4 md:px-6 py-3 backdrop-blur-lg bg-opacity-80">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                  <div 
                    onClick={() => navigate(isAuthenticated ? '/marketplace' : '/')}
                    className="cursor-pointer hover:opacity-80 transition"
                  >
                    <Logo showText={false} className="sm:hidden" />
                    <Logo className="hidden sm:flex" />
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileNavOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                  </svg>
                </button>

                {/* Center Navigation */}
                <div className="hidden md:flex items-center gap-1">
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => {
                          if (window.location.pathname !== '/') {
                            navigate('/');
                            setTimeout(() => {
                              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          } else {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Features
                      </button>
                      <button
                        onClick={() => {
                          if (window.location.pathname !== '/') {
                            navigate('/');
                            setTimeout(() => {
                              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          } else {
                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        How It Works
                      </button>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Marketplace
                      </button>
                      <button
                        onClick={() => navigate('/contact')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Contact
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Marketplace
                      </button>
                      <button
                        onClick={() => navigate('/create-listing')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Sell Phone
                      </button>
                      <button
                        onClick={handleUploadClick}
                        className="w-9 h-9 bg-[#c4ff0d] rounded-full flex items-center justify-center hover:bg-[#d4ff3d] transition transform hover:scale-110 shadow-lg shadow-[#c4ff0d]/30"
                        title="Upload Reel"
                      >
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate('/explore')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a] flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Explore
                      </button>
                      <button
                        onClick={() => navigate('/reels')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Reels
                      </button>
                      <button
                        onClick={() => navigate('/complaints')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Complaints
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => navigate('/admin')}
                          className="text-[#c4ff0d] hover:text-[#d4ff3d] px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                        >
                          Admin
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => navigate('/auth/signin')}
                        className="text-white hover:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition hidden sm:block"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => navigate('/auth/signup')}
                        className="bg-[#c4ff0d] text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4ff3d] transition transform hover:scale-105 shadow-lg shadow-[#c4ff0d]/30"
                      >
                        Get Started
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Profile Dropdown */}
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                          className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                        >
                          <span>{user?.name || 'User'}</span>
                          <svg className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                          <div className="absolute right-0 mt-2 w-64 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
                            {/* User Info Header */}
                            <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#c4ff0d] rounded-full flex items-center justify-center">
                                  <span className="text-black font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{user?.name}</p>
                                  <p className="text-gray-400 text-xs">{user?.anonymousId || 'USER_XXXXX'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                              <button
                                onClick={() => {
                                  navigate('/profile');
                                  setShowProfileDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">My Profile</p>
                                  <p className="text-xs text-gray-500">View and edit profile</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false);
                                  navigate('/dashboard');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">Overview</p>
                                  <p className="text-xs text-gray-500">Dashboard stats</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false);
                                  setTimeout(() => {
                                    navigate('/dashboard');
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'my-phones' }));
                                  }, 100);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">My Phones</p>
                                  <p className="text-xs text-gray-500">Listed phones</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false);
                                  setTimeout(() => {
                                    navigate('/dashboard');
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'my-bids' }));
                                  }, 100);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">My Bids</p>
                                  <p className="text-xs text-gray-500">Active bids</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false);
                                  setTimeout(() => {
                                    navigate('/dashboard');
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'sold-phones' }));
                                  }, 100);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">Sold Phones</p>
                                  <p className="text-xs text-gray-500">Completed sales</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false);
                                  setTimeout(() => {
                                    navigate('/dashboard');
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'purchased-phones' }));
                                  }, 100);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">Purchased</p>
                                  <p className="text-xs text-gray-500">Won auctions</p>
                                </div>
                              </button>


                            </div>

                            {/* Logout */}
                            <div className="border-t border-[#2a2a2a] p-2">
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition rounded-lg text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-sm font-medium">Logout</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile Navigation Menu */}
            {mobileNavOpen && (
              <div className="md:hidden mt-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4">
                <div className="space-y-2">
                  <button onClick={() => { navigate('/marketplace'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Marketplace</button>
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => { navigate('/create-listing'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Sell Phone</button>
                      <button onClick={() => { handleUploadClick(); setMobileNavOpen(false); }} className="w-full flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">
                        <div className="w-8 h-8 bg-[#c4ff0d] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span>Upload Reel</span>
                      </button>
                      <button onClick={() => { navigate('/explore'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Explore
                      </button>
                      <button onClick={() => { navigate('/reels'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Reels</button>
                      <button onClick={() => { navigate('/dashboard'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Dashboard</button>
                      <button onClick={() => { navigate('/profile'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Profile</button>
                      {user?.role === 'admin' && <button onClick={() => { navigate('/admin'); setMobileNavOpen(false); }} className="w-full text-left text-[#c4ff0d] px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Admin</button>}
                      <button onClick={() => { handleLogout(); setMobileNavOpen(false); }} className="w-full text-left text-red-400 px-4 py-3 rounded-lg hover:bg-red-500/10 transition">Logout</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { 
                        setMobileNavOpen(false);
                        if (window.location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        } else {
                          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Features</button>
                      <button onClick={() => { 
                        setMobileNavOpen(false);
                        if (window.location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        } else {
                          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">How It Works</button>
                      <button onClick={() => { navigate('/contact'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Contact</button>
                      <button onClick={() => { navigate('/auth/signin'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Sign In</button>
                      <button onClick={() => { navigate('/auth/signup'); setMobileNavOpen(false); }} className="w-full bg-[#c4ff0d] text-black px-4 py-3 rounded-lg font-semibold">Get Started</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<ProfessionalHome />} />
            <Route path="/home-old" element={<Home />} />
              
              {/* Auth Routes */}
              <Route path="/auth/signin" element={<Login />} />
              <Route path="/test-login" element={<SimpleLogin />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              
              {/* Marketplace Routes */}
              <Route path="/marketplace" element={<EnhancedMarketplace />} />
              <Route path="/marketplace-old" element={<Marketplace />} />
              <Route path="/phone/:id" element={<PhoneDetail />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              
              {/* Public Profile Route */}
              <Route path="/user/:anonymousId" element={<PublicProfile />} />
              
              {/* Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard-old" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Listing Creation Routes */}
              <Route 
                path="/create-listing" 
                element={
                  <ProtectedRoute>
                    <CreatePhoneListing />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-listing-old" 
                element={
                  <ProtectedRoute>
                    <CreateListing />
                  </ProtectedRoute>
                } 
              />
              
              {/* Reels Route */}
              <Route path="/reels" element={<Reels />} />
              
              {/* Explore Route */}
              <Route path="/explore" element={<Explore />} />

              {/* Static Pages */}
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/security" element={<Security />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />

              {/* Complaints Route */}
              <Route 
                path="/complaints" 
                element={
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes - Admin Only */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              </Routes>
            </Suspense>
          </main>

          <Toaster position="top-right" />
          {/* Hide chatbot on reels page */}
          {location.pathname !== '/reels' && (
            <Suspense fallback={null}>
              <Chatbot />
            </Suspense>
          )}

          {/* Upload Reel Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Upload Reel</h2>
                  <button 
                    onClick={closeUploadModal}
                    disabled={uploading}
                    className="p-2 hover:bg-[#1a1a1a] rounded-full disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Upload Area */}
                {!selectedVideo ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-8 text-center cursor-pointer hover:border-[#c4ff0d] transition"
                  >
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Click to select video</p>
                    <p className="text-gray-500 text-sm">Max 30 seconds, up to 50MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                          <Upload className="w-6 h-6 text-[#c4ff0d]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{selectedVideo.name}</p>
                          <p className="text-gray-500 text-sm">
                            {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB - {videoDuration.toFixed(1)}s
                          </p>
                        </div>
                        {!uploading && (
                          <button 
                            onClick={() => setSelectedVideo(null)}
                            className="p-2 hover:bg-[#2a2a2a] rounded-full"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                      <textarea
                        value={reelDescription}
                        onChange={(e) => setReelDescription(e.target.value)}
                        placeholder="Add a description..."
                        maxLength={500}
                        disabled={uploading}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d] resize-none h-24 disabled:opacity-50"
                      />
                      <p className="text-gray-500 text-xs mt-1 text-right">{reelDescription.length}/500</p>
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#c4ff0d] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-center text-gray-400 text-sm">Uploading... {uploadProgress}%</p>
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      onClick={handleUploadReel}
                      disabled={uploading}
                      className="w-full bg-[#c4ff0d] text-black py-3 rounded-xl font-semibold hover:bg-[#d4ff3d] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Reel
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Info */}
                <p className="text-gray-500 text-xs text-center mt-4">
                  Videos must be 30 seconds or less
                </p>
              </div>
            </div>
          )}
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
