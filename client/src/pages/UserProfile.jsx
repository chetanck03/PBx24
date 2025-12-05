import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, phoneAPI, bidAPI, reelAPI } from '../services/api';
import Footer from '../components/common/Footer';
import UserReels from '../components/reels/UserReels';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ phones: 0, bids: 0, won: 0, reels: 0 });
  const [activeTab, setActiveTab] = useState('selling');
  const [myPhones, setMyPhones] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, phonesRes, bidsRes, reelsRes] = await Promise.all([
        userAPI.getProfile(),
        phoneAPI.getSellerPhones().catch(() => ({ data: { data: [] } })),
        bidAPI.getUserBids().catch(() => ({ data: { data: [] } })),
        reelAPI.getMyReels(1, 100).catch(() => ({ data: { data: [], pagination: { total: 0 } } }))
      ]);
      
      const userData = userRes.data.data;
      setUser(userData);
      
      const phones = phonesRes.data.data || [];
      const bids = bidsRes.data.data || [];
      const reelsTotal = reelsRes.data.pagination?.total || reelsRes.data.data?.length || 0;
      setMyPhones(phones);
      setMyBids(bids);
      
      setStats({
        phones: phones.length,
        bids: bids.length,
        won: bids.filter(b => b.isWinning).length,
        reels: reelsTotal
      });
    } catch (error) {
      console.error('Error loading profile:', error);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            {/* User Info */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-[#c4ff0d] rounded-full flex items-center justify-center border-4 border-[#1a1a1a]">
                  <span className="text-black text-4xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0f0f0f]"></div>
              </div>
              
              {/* Details */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">T. {user?.name}</h1>
                <p className="text-gray-400 text-sm mb-3">{user?.email}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    {user?.anonymousId}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c4ff0d] bg-opacity-20 border border-[#c4ff0d] rounded-lg text-xs text-[#c4ff0d] font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    KYC VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Wallet Balance */}
            <div className="bg-[#1a1a1a] border-2 border-[#c4ff0d] rounded-xl p-6 hover:shadow-lg hover:shadow-[#c4ff0d]/20 transition">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-8 h-8 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-[#c4ff0d] mb-2">₹{user?.walletBalance || 0}</p>
              <p className="text-sm text-gray-400">Wallet Balance</p>
            </div>

            {/* Phones Listed */}
            <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl p-6 hover:border-[#c4ff0d] hover:shadow-lg hover:shadow-[#c4ff0d]/10 transition">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.phones}</p>
              <p className="text-sm text-gray-400">Phones Listed</p>
            </div>

            {/* Active Bids */}
            <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl p-6 hover:border-[#c4ff0d] hover:shadow-lg hover:shadow-[#c4ff0d]/10 transition relative">
              <div className="absolute top-3 right-3">
                <span className="bg-[#c4ff0d] text-black text-xs font-bold px-2 py-1 rounded">LIVE</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.bids}</p>
              <p className="text-sm text-gray-400">Active Bids</p>
            </div>

            {/* Auctions Won */}
            <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl p-6 hover:border-[#c4ff0d] hover:shadow-lg hover:shadow-[#c4ff0d]/10 transition">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.won}</p>
              <p className="text-sm text-gray-400">Auctions Won</p>
            </div>
          </div>
        </div>

        {/* Government ID Verification */}
        {user?.governmentIdProof && (
          <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#c4ff0d] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Government ID Verification</h3>
                  <p className="text-sm text-gray-400">
                    Status: <span className="text-[#c4ff0d] font-semibold">✓ Verified: {user.governmentIdType || 'Aadhaar'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.open(user.governmentIdProof, '_blank')}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Click to view full size
              </button>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-[#2a2a2a]">
            <button
              onClick={() => setActiveTab('selling')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition relative ${
                activeTab === 'selling'
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>My Listings</span>
                <span className="ml-1 px-2 py-0.5 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-xs font-bold">
                  {stats.phones}
                </span>
              </div>
              {activeTab === 'selling' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4ff0d]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('buying')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition relative ${
                activeTab === 'buying'
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>My Bids</span>
                <span className="ml-1 px-2 py-0.5 bg-purple-500 bg-opacity-20 text-purple-400 rounded-full text-xs font-bold">
                  {stats.bids}
                </span>
              </div>
              {activeTab === 'buying' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4ff0d]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition relative ${
                activeTab === 'reels'
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>My Reels</span>
                <span className="ml-1 px-2 py-0.5 bg-red-500 bg-opacity-20 text-red-400 rounded-full text-xs font-bold">
                  {stats.reels}
                </span>
              </div>
              {activeTab === 'reels' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c4ff0d]"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'selling' && (
              <div>
                {myPhones.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Listings Yet</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Start selling your phones and reach thousands of buyers
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition"
                      >
                        [View Details]
                      </button>
                      <button
                        onClick={() => navigate('/create-listing')}
                        className="px-6 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold"
                      >
                        Start Selling Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPhones.map((phone) => (
                      <div
                        key={phone._id}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#c4ff0d] transition cursor-pointer group"
                        onClick={() => navigate(`/phone/${phone._id}`)}
                      >
                        <div className="relative h-48 bg-[#0f0f0f]">
                          {phone.images?.[0] && (
                            <img 
                              src={phone.images[0]} 
                              alt={phone.model} 
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                            />
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              phone.verificationStatus === 'approved' ? 'bg-green-500 text-white' :
                              phone.verificationStatus === 'rejected' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-black'
                            }`}>
                              {phone.verificationStatus === 'approved' ? '✓ Approved' :
                               phone.verificationStatus === 'rejected' ? '✗ Rejected' :
                               '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-white mb-2 group-hover:text-[#c4ff0d] transition">
                            {phone.brand} {phone.model}
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            {phone.storage} • {phone.condition}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
                            <span className="text-sm text-gray-500">Starting Bid</span>
                            <span className="text-xl font-bold text-[#c4ff0d]">
                              ₹{phone.minBidPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'buying' && (
              <div>
                {myBids.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Bids Yet</h3>
                    <p className="text-gray-400 mb-8">You haven't placed any bids yet</p>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="px-8 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBids.map((bid) => (
                      <div
                        key={bid._id}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#c4ff0d] transition cursor-pointer"
                        onClick={() => bid.phone?._id && navigate(`/phone/${bid.phone._id}`)}
                      >
                        {bid.phone && (
                          <>
                            <div className="h-48 bg-[#0f0f0f]">
                              {bid.phone.images?.[0] && (
                                <img src={bid.phone.images[0]} alt={bid.phone.model} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="p-5">
                              <h3 className="font-bold text-lg text-white mb-2">
                                {bid.phone.brand} {bid.phone.model}
                              </h3>
                              <p className="text-sm text-gray-400 mb-4">
                                {bid.phone.storage} • {bid.phone.condition}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Your Bid:</span>
                                  <span className="text-lg font-bold text-[#c4ff0d]">₹{bid.bidAmount}</span>
                                </div>
                                
                                {bid.auction && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Current Bid:</span>
                                    <span className="text-sm font-semibold text-white">₹{bid.auction.currentBid}</span>
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center pt-2 border-t border-[#2a2a2a]">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    bid.isWinning ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-gray-700 text-gray-400'
                                  }`}>
                                    {bid.isWinning ? '🏆 Winning' : 'Outbid'}
                                  </span>
                                  {bid.auction && (
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                      bid.auction.status === 'active' ? 'bg-[#c4ff0d] bg-opacity-20 text-[#c4ff0d]' :
                                      'bg-gray-700 text-gray-400'
                                    }`}>
                                      {bid.auction.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reels' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">My Reels</h3>
                  <button
                    onClick={() => navigate('/reels')}
                    className="px-4 py-2 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] transition font-semibold text-sm"
                  >
                    + Create Reel
                  </button>
                </div>
                <UserReels userId={user?._id} showDeleteButton={true} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
