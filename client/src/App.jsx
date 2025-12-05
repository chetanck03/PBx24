
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useState, useRef, useEffect } from 'react';

// Pages
import Home from './pages/Home';
import ProfessionalHome from './pages/ProfessionalHome';
import Login from './pages/Login';
import SimpleLogin from './pages/SimpleLogin';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Marketplace from './pages/Marketplace';
import EnhancedMarketplace from './pages/EnhancedMarketplace';
import PhoneDetail from './pages/PhoneDetail';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import CreateListing from './pages/CreateListing';
import CreatePhoneListing from './pages/CreatePhoneListing';
import ListingDetail from './pages/ListingDetail';
import AdminPanel from './pages/AdminPanel';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Complaints from './pages/Complaints';
import Reels from './pages/Reels';
import Chatbot from './components/chatbot/Chatbot';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Pages that should not show the navbar (only auth pages)
  const noNavbarPages = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];
  const showNavbar = !noNavbarPages.includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileDropdown(false);
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
                  <h1 
                    onClick={() => navigate(isAuthenticated ? '/marketplace' : '/')}
                    className="text-xl font-bold text-white cursor-pointer flex items-center gap-2 hover:opacity-80 transition"
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-[#c4ff0d] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-[#c4ff0d]/30">
                      <span className="text-black font-bold text-base md:text-lg">P</span>
                    </div>
                    <span className="hidden sm:inline">PhoneBid</span>
                  </h1>
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
                      <a href="#features" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]">
                        Features
                      </a>
                      <a href="#how-it-works" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]">
                        How It Works
                      </a>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#1a1a1a]"
                      >
                        Marketplace
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

                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false);
                                  setTimeout(() => {
                                    navigate('/dashboard');
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'wallet' }));
                                  }, 100);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c4ff0d] transition text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">Wallet</p>
                                  <p className="text-xs text-gray-500">₹{user?.walletBalance || 0}</p>
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
                      <button onClick={() => { navigate('/reels'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Reels</button>
                      <button onClick={() => { navigate('/dashboard'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Dashboard</button>
                      <button onClick={() => { navigate('/profile'); setMobileNavOpen(false); }} className="w-full text-left text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Profile</button>
                      {user?.role === 'admin' && <button onClick={() => { navigate('/admin'); setMobileNavOpen(false); }} className="w-full text-left text-[#c4ff0d] px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition">Admin</button>}
                      <button onClick={() => { handleLogout(); setMobileNavOpen(false); }} className="w-full text-left text-red-400 px-4 py-3 rounded-lg hover:bg-red-500/10 transition">Logout</button>
                    </>
                  ) : (
                    <>
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

              {/* Complaints Route */}
              <Route 
                path="/complaints" 
                element={
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-old" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>

          <Toaster position="top-right" />
          {/* Hide chatbot on reels page */}
          {location.pathname !== '/reels' && <Chatbot />}
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
