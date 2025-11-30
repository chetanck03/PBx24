import { useState, useEffect } from 'react';
import { userAPI, phoneAPI, bidAPI, transactionAPI, auctionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [myPhones, setMyPhones] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletOperation, setWalletOperation] = useState('add');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [phoneAuctions, setPhoneAuctions] = useState({});
  const [phoneBids, setPhoneBids] = useState({});
  const [selectedPhoneForBids, setSelectedPhoneForBids] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'my-phones' && myPhones.length > 0) {
      loadPhoneAuctions();
      
      // Set up polling for live updates every 5 seconds
      const interval = setInterval(() => {
        loadPhoneAuctions();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [myPhones, activeTab]);
  
  // Live countdown timer
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [userRes, phonesRes, bidsRes, transactionsRes] = await Promise.all([
        userAPI.getProfile(),
        phoneAPI.getSellerPhones().catch(() => ({ data: { data: [] } })),
        bidAPI.getUserBids().catch(() => ({ data: { data: [] } })),
        transactionAPI.getUserTransactions().catch(() => ({ data: { data: [] } }))
      ]);
      
      setUser(userRes.data.data);
      setMyPhones(phonesRes.data.data);
      setMyBids(bidsRes.data.data);
      setMyTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPhoneAuctions = async () => {
    try {
      const auctionsData = {};
      const bidsData = {};
      
      for (const phone of myPhones) {
        try {
          const auctionRes = await auctionAPI.getAuctionByPhoneId(phone._id);
          if (auctionRes.data.data) {
            auctionsData[phone._id] = auctionRes.data.data;
            
            // Load bids for this auction
            const bidsRes = await bidAPI.getSellerAuctionBids(auctionRes.data.data._id);
            bidsData[phone._id] = bidsRes.data.data || [];
          }
        } catch (err) {
          // No auction for this phone
        }
      }
      
      setPhoneAuctions(auctionsData);
      setPhoneBids(bidsData);
    } catch (error) {
      console.error('Error loading phone auctions:', error);
    }
  };
  
  const handleAcceptBid = async (bidId, phoneId) => {
    if (!confirm('Are you sure you want to accept this bid and end the auction?')) {
      return;
    }
    
    try {
      await bidAPI.acceptBid(bidId);
      alert('Bid accepted successfully! Auction has ended.');
      loadDashboardData();
      loadPhoneAuctions();
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to accept bid');
    }
  };
  
  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handleWalletUpdate = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateWallet(parseFloat(walletAmount), walletOperation);
      setWalletAmount('');
      loadDashboardData();
      alert('Wallet updated successfully!');
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to update wallet');
    }
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.submitKYC({ submitted: true });
      setShowKYCModal(false);
      loadDashboardData();
      alert('KYC submitted successfully!');
    } catch (error) {
      alert('Failed to submit KYC');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="mt-1 text-gray-600">Welcome back, {user?.name}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Anonymous ID</p>
                <p className="text-lg font-semibold text-blue-600">{user?.anonymousId}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{user?.walletBalance || 0}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">KYC Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  user?.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                  user?.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.kycStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'my-phones', 'my-bids', 'transactions', 'wallet'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">My Phones</h3>
              <p className="text-3xl font-bold text-blue-600">{myPhones.length}</p>
              <p className="text-sm text-gray-600 mt-2">Total listings</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">My Bids</h3>
              <p className="text-3xl font-bold text-green-600">{myBids.length}</p>
              <p className="text-sm text-gray-600 mt-2">Active bids</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Transactions</h3>
              <p className="text-3xl font-bold text-purple-600">{myTransactions.length}</p>
              <p className="text-sm text-gray-600 mt-2">Total transactions</p>
            </div>
          </div>
        )}

        {activeTab === 'my-phones' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Phone Listings</h2>
              <button
                onClick={() => navigate('/create-listing')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create New Listing
              </button>
            </div>
            
            {myPhones.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No phone listings yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myPhones.map((phone) => {
                  const auction = phoneAuctions[phone._id];
                  const bids = phoneBids[phone._id] || [];
                  const isExpanded = selectedPhoneForBids === phone._id;
                  
                  return (
                    <div key={phone._id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                        {/* Phone Image */}
                        <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                          {phone.images?.[0] && (
                            <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover" />
                          )}
                        </div>
                        
                        {/* Phone Details */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-xl">{phone.brand} {phone.model}</h3>
                              <p className="text-sm text-gray-600">{phone.storage} • {phone.condition}</p>
                            </div>
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${
                              phone.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              phone.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {phone.verificationStatus}
                            </span>
                          </div>
                          
                          {/* Auction Info */}
                          {auction ? (
                            <div className="mt-4 space-y-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Current Bid</p>
                                  <p className="text-2xl font-bold text-blue-600">
                                    ₹{auction.currentBid || phone.minBidPrice}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Total Bids</p>
                                  <p className="text-2xl font-bold text-green-600">{auction.totalBids}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                    auction.status === 'active' ? 'bg-green-100 text-green-800' :
                                    auction.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {auction.status}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Time Remaining</p>
                                  <p className="text-lg font-semibold text-red-600">
                                    {getTimeRemaining(auction.auctionEndTime)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* View Bids Button */}
                              {auction.status === 'active' && bids.length > 0 && (
                                <button
                                  onClick={() => setSelectedPhoneForBids(isExpanded ? null : phone._id)}
                                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                  {isExpanded ? 'Hide Bids' : `View ${bids.length} Bid${bids.length !== 1 ? 's' : ''}`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">Min Bid Price</p>
                              <p className="text-2xl font-bold text-blue-600">₹{phone.minBidPrice}</p>
                              <p className="text-sm text-gray-500 mt-2">No active auction</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Bids List */}
                      {isExpanded && bids.length > 0 && (
                        <div className="border-t p-4 bg-gray-50">
                          <h4 className="font-semibold mb-3">Live Bids</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {bids.map((bid) => (
                              <div key={bid._id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                <div>
                                  <p className="font-semibold text-gray-900">{bid.anonymousBidderId}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(bid.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">₹{bid.bidAmount}</p>
                                    {bid.isWinning && (
                                      <span className="text-xs text-green-600 font-semibold">Leading</span>
                                    )}
                                  </div>
                                  {auction.status === 'active' && (
                                    <button
                                      onClick={() => handleAcceptBid(bid._id, phone._id)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition"
                                    >
                                      Accept
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-bids' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Bids</h2>
            
            {myBids.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No bids placed yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bid Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myBids.map((bid) => (
                      <tr key={bid._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.auctionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">₹{bid.bidAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {bid.isWinning ? 'Winning' : 'Outbid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(bid.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Wallet Management</h2>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-gray-600">Current Balance</p>
                <p className="text-4xl font-bold text-green-600">₹{user?.walletBalance || 0}</p>
              </div>
              
              <form onSubmit={handleWalletUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                  <select
                    value={walletOperation}
                    onChange={(e) => setWalletOperation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="add">Add Funds</option>
                    <option value="subtract">Withdraw Funds</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Update Wallet
                </button>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">KYC Verification</h3>
              <p className="text-gray-600 mb-4">
                Current Status: <span className={`font-semibold ${
                  user?.kycStatus === 'verified' ? 'text-green-600' :
                  user?.kycStatus === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>{user?.kycStatus}</span>
              </p>
              
              {user?.kycStatus === 'pending' && (
                <p className="text-sm text-gray-500">Your KYC is under review</p>
              )}
              
              {user?.kycStatus !== 'verified' && user?.kycStatus !== 'pending' && (
                <button
                  onClick={() => setShowKYCModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit KYC
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KYC Modal */}
      {showKYCModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Submit KYC</h3>
            <form onSubmit={handleKYCSubmit}>
              <p className="text-gray-600 mb-4">
                KYC verification helps ensure platform security. Your information will be reviewed by our admin team.
              </p>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowKYCModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
