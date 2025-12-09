import { useState, useEffect, useCallback } from 'react';
import { userAPI, phoneAPI, bidAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';


const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [myPhones, setMyPhones] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [soldPhones, setSoldPhones] = useState([]);
  const [purchasedPhones, setPurchasedPhones] = useState([]);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'my-phones', label: 'My Phones' },
    { id: 'my-bids', label: 'My Bids' },
    { id: 'sold-phones', label: 'Sold Phones' },
    { id: 'purchased-phones', label: 'Purchased' },
    { id: 'wallet', label: 'Wallet' },
  ];

  useEffect(() => {
    loadDashboardData();
    
    // Listen for tab change events from dropdown menu
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };
    
    window.addEventListener('changeTab', handleTabChange);
    
    return () => {
      window.removeEventListener('changeTab', handleTabChange);
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, phonesRes, bidsRes, soldRes, purchasedRes] = await Promise.all([
        userAPI.getProfile(),
        phoneAPI.getSellerPhones().catch(() => ({ data: { data: [] } })),
        bidAPI.getUserBids().catch(() => ({ data: { data: [] } })),
        phoneAPI.getSoldPhones().catch(() => ({ data: { data: [] } })),
        phoneAPI.getPurchasedPhones().catch(() => ({ data: { data: [] } }))
      ]);
      
      const userData = userRes.data.data;
      setUser(userData);
      setMyPhones(phonesRes.data.data || []);
      setMyBids(bidsRes.data.data || []);
      setSoldPhones(soldRes.data.data || []);
      setPurchasedPhones(purchasedRes.data.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4ff0d]"></div>
      </div>
    );
  }

  const stats = {
    phones: myPhones.length,
    bids: myBids.length,
    sold: soldPhones.length,
    purchased: purchasedPhones.length,
    wallet: user?.walletBalance || 0
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#c4ff0d] rounded-full flex items-center justify-center">
                  <span className="text-black text-xl font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.name}</p>
                  <p className="text-[#c4ff0d] text-xs font-mono">{user?.anonymousId?.slice(0, 12)}...</p>
                </div>
              </div>
              <p className="text-[#c4ff0d] font-bold">₹{stats.wallet}</p>
            </div>
            {/* Mobile Tab Selector */}
            <div className="grid grid-cols-3 gap-2">
              {menuItems.slice(0, 6).map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition ${activeTab === item.id ? 'bg-[#c4ff0d] text-black' : 'bg-[#1a1a1a] text-gray-400'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-2">My Dashboard</h2>
              <p className="text-gray-400 text-sm mb-8">Welcome back, {user?.name}</p>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-[#c4ff0d] rounded-full flex items-center justify-center">
                    <span className="text-black text-2xl font-bold">{user?.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">Anonymous ID:</p>
                    <p className="text-[#c4ff0d] text-xs font-mono truncate">{user?.anonymousId}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
                  <div>
                    <p className="text-gray-400 text-xs">Wallet Balance:</p>
                    <p className="text-[#c4ff0d] text-xl font-bold">₹{stats.wallet}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>KYC Verified</span>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    activeTab === 'overview'
                      ? 'bg-[#c4ff0d] text-black'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold">Overview</p>
                    <p className="text-xs opacity-70">Dashboard stats</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('my-phones')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    activeTab === 'my-phones'
                      ? 'bg-[#c4ff0d] text-black'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold">My Phones</p>
                    <p className="text-xs opacity-70">Listed phones</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('my-bids')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    activeTab === 'my-bids'
                      ? 'bg-[#c4ff0d] text-black'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold">My Bids</p>
                    <p className="text-xs opacity-70">Active bids</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('sold-phones')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    activeTab === 'sold-phones'
                      ? 'bg-[#c4ff0d] text-black'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold">Sold Phones</p>
                    <p className="text-xs opacity-70">Completed sales</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('purchased-phones')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    activeTab === 'purchased-phones'
                      ? 'bg-[#c4ff0d] text-black'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold">Purchased</p>
                    <p className="text-xs opacity-70">Won auctions</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    activeTab === 'wallet'
                      ? 'bg-[#c4ff0d] text-black'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold">Wallet</p>
                    <p className="text-xs opacity-70">₹{stats.wallet}</p>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Overview</h1>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-3xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{stats.phones}</p>
                    <p className="text-xs sm:text-sm text-gray-400">My Phones</p>
                  </div>

                  <div className="bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-xl p-4 sm:p-6 hover:border-[#c4ff0d] transition">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="bg-[#c4ff0d] text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">LIVE</span>
                    </div>
                    <p className="text-3xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{stats.bids}</p>
                    <p className="text-xs sm:text-sm text-gray-400">My Bids</p>
                  </div>

                  <div className="bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-xl p-4 sm:p-6 hover:border-[#c4ff0d] transition">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{stats.sold}</p>
                    <p className="text-xs sm:text-sm text-gray-400">Sold Phones</p>
                  </div>

                  <div className="bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-xl p-4 sm:p-6 hover:border-[#c4ff0d] transition">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-3xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{stats.purchased}</p>
                    <p className="text-xs sm:text-sm text-gray-400">Purchased</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl sm:rounded-2xl p-4 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <button
                      onClick={() => navigate('/create-listing')}
                      className="bg-[#c4ff0d] text-black p-4 sm:p-6 rounded-xl hover:bg-[#d4ff3d] transition text-left"
                    >
                      <p className="font-bold text-base sm:text-lg mb-1 sm:mb-2">List a Phone</p>
                      <p className="text-xs sm:text-sm opacity-80">Sell your device</p>
                    </button>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] text-white p-4 sm:p-6 rounded-xl hover:border-[#c4ff0d] transition text-left"
                    >
                      <p className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Browse Phones</p>
                      <p className="text-xs sm:text-sm text-gray-400">Find great deals</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] text-white p-4 sm:p-6 rounded-xl hover:border-[#c4ff0d] transition text-left"
                    >
                      <p className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Manage Wallet</p>
                      <p className="text-xs sm:text-sm text-gray-400">Add or withdraw funds</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'my-phones' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">My Phones</h1>
                {myPhones.length === 0 ? (
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl sm:rounded-2xl p-10 sm:p-20 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Phones Listed</h3>
                    <p className="text-gray-400 mb-8 text-sm sm:text-base">Start selling your phones today</p>
                    <button
                      onClick={() => navigate('/create-listing')}
                      className="px-6 sm:px-8 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold text-sm sm:text-base"
                    >
                      List Your First Phone
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {myPhones.map((phone) => (
                      <div
                        key={phone._id}
                        className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#c4ff0d] transition cursor-pointer"
                        onClick={() => navigate(`/phone/${phone._id}`)}
                      >
                        <div className="h-40 sm:h-48 bg-[#1a1a1a]">
                          {phone.images?.[0] && (
                            <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-base sm:text-lg text-white mb-2">{phone.brand} {phone.model}</h3>
                          <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">{phone.storage} - {phone.condition}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-500">Min Bid</span>
                            <span className="text-lg sm:text-xl font-bold text-[#c4ff0d]">₹{phone.minBidPrice?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-bids' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">My Bids</h1>
                {myBids.length === 0 ? (
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl sm:rounded-2xl p-10 sm:p-20 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Active Bids</h3>
                    <p className="text-gray-400 mb-8 text-sm sm:text-base">Browse marketplace to place bids</p>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="px-6 sm:px-8 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold text-sm sm:text-base"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {myBids.map((bid) => (
                      <div 
                        key={bid._id} 
                        className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#c4ff0d] transition cursor-pointer"
                        onClick={() => bid.phone?._id && navigate(`/phone/${bid.phone._id}`)}
                      >
                        {/* Phone Image */}
                        <div className="h-36 sm:h-40 bg-[#1a1a1a]">
                          {bid.phone?.images?.[0] ? (
                            <img 
                              src={bid.phone.images[0]} 
                              alt="Phone" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4 sm:p-5">
                          {/* Phone Details */}
                          {bid.phone ? (
                            <div className="mb-3">
                              <h3 className="font-bold text-base sm:text-lg text-white">
                                {bid.phone.brand} {bid.phone.model}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {bid.phone.storage} - {bid.phone.condition}
                              </p>
                            </div>
                          ) : (
                            <div className="mb-3">
                              <h3 className="font-bold text-base sm:text-lg text-white">Phone Details</h3>
                              <p className="text-xs sm:text-sm text-gray-400">Loading...</p>
                            </div>
                          )}
                          {/* Bid Info */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm text-gray-500">Your Bid</span>
                            <span className="text-lg sm:text-xl font-bold text-[#c4ff0d]">₹{bid.bidAmount?.toLocaleString()}</span>
                          </div>
                          {/* Status Badge */}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${
                              bid.isWinning ? 'bg-green-500/20 text-green-400' : 
                              bid.status === 'outbid' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {bid.isWinning ? 'Leading' : bid.status || 'Active'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(bid.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sold-phones' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Sold Phones</h1>
                {soldPhones.length === 0 ? (
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-10 sm:p-20 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Sold Phones Yet</h3>
                    <p className="text-gray-400 mb-8 text-sm sm:text-base">Your sold phones will appear here once a buyer accepts your listing</p>
                    <button
                      onClick={() => navigate('/create-listing')}
                      className="px-6 sm:px-8 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold text-sm sm:text-base"
                    >
                      List a Phone to Sell
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {soldPhones.map((phone) => (
                      <div
                        key={phone._id}
                        className="bg-[#0f0f0f] border border-green-500/30 rounded-xl overflow-hidden hover:border-green-500 transition cursor-pointer"
                        onClick={() => navigate(`/phone/${phone._id}`)}
                      >
                        <div className="relative h-40 sm:h-48 bg-[#1a1a1a]">
                          {phone.images?.[0] && (
                            <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            SOLD
                          </div>
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-base sm:text-lg text-white mb-2">{phone.brand} {phone.model}</h3>
                          <p className="text-xs sm:text-sm text-gray-400 mb-3">{phone.storage} - {phone.condition}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm text-gray-500">Sold For</span>
                            <span className="text-lg sm:text-xl font-bold text-green-400">₹{phone.soldPrice?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Buyer: {phone.buyerAnonymousId}</span>
                            <span>{new Date(phone.soldAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'purchased-phones' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Purchased Phones</h1>
                {purchasedPhones.length === 0 ? (
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-10 sm:p-20 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Purchases Yet</h3>
                    <p className="text-gray-400 mb-8 text-sm sm:text-base">Phones you win in auctions will appear here</p>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="px-6 sm:px-8 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold text-sm sm:text-base"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {purchasedPhones.map((phone) => (
                      <div
                        key={phone._id}
                        className="bg-[#0f0f0f] border border-[#c4ff0d]/30 rounded-xl overflow-hidden hover:border-[#c4ff0d] transition cursor-pointer"
                        onClick={() => navigate(`/phone/${phone._id}`)}
                      >
                        <div className="relative h-40 sm:h-48 bg-[#1a1a1a]">
                          {phone.images?.[0] && (
                            <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 right-2 bg-[#c4ff0d] text-black text-xs font-bold px-2 py-1 rounded">
                            WON
                          </div>
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-base sm:text-lg text-white mb-2">{phone.brand} {phone.model}</h3>
                          <p className="text-xs sm:text-sm text-gray-400 mb-3">{phone.storage} - {phone.condition}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm text-gray-500">Paid</span>
                            <span className="text-lg sm:text-xl font-bold text-[#c4ff0d]">₹{phone.purchasePrice?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Seller: {phone.sellerAnonymousId}</span>
                            <span>{new Date(phone.purchasedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Wallet</h1>
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <p className="text-gray-400 mb-2 text-sm sm:text-base">Current Balance</p>
                    <p className="text-4xl sm:text-6xl font-bold text-[#c4ff0d]">₹{stats.wallet}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button className="bg-[#c4ff0d] text-black py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#d4ff3d] transition text-sm sm:text-base">
                      Add Funds
                    </button>
                    <button className="bg-[#1a1a1a] border border-[#2a2a2a] text-white py-3 sm:py-4 rounded-lg font-semibold hover:border-[#c4ff0d] transition text-sm sm:text-base">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
