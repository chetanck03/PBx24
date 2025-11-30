
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProfessionalHome from './pages/ProfessionalHome';
import Login from './pages/Login';
import SimpleLogin from './pages/SimpleLogin';
import SignIn from './pages/SignIn';
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

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Pages that should not show the navbar (only auth pages)
  const noNavbarPages = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];
  const showNavbar = !noNavbarPages.includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 
                  onClick={() => navigate(isAuthenticated ? '/marketplace' : '/')}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                >
                  📱 PhoneBid
                </h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {!isAuthenticated ? (
                    <>
                      <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">
                        Features
                      </a>
                      <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">
                        How It Works
                      </a>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Marketplace
                      </button>
                      <button
                        onClick={() => navigate('/auth/signin')}
                        className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => navigate('/auth/signup')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition transform hover:scale-105"
                      >
                        Get Started
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Marketplace
                      </button>
                      <button
                        onClick={() => navigate('/create-listing')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Sell Phone
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/complaints')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Complaints
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => navigate('/admin')}
                          className="text-purple-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/profile')}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        {user?.name}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main>
        <Routes>
          <Route path="/" element={<ProfessionalHome />} />
          <Route path="/home-old" element={<Home />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/test-login" element={<SimpleLogin />} />
              <Route path="/auth/signin" element={<SignIn />} />
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
