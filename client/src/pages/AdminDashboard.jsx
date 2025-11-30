import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [phones, setPhones] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPhones, setUserPhones] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, phonesRes, transactionsRes] = await Promise.all([
        adminAPI.getPlatformStatistics(),
        adminAPI.getAllUsers({ limit: 10 }),
        adminAPI.getAllPhones({ limit: 10, verificationStatus: 'pending' }),
        adminAPI.getAllTransactions({ limit: 10 })
      ]);
      
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setPhones(phonesRes.data.data);
      setTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await adminAPI.searchByIds(searchQuery);
      setSearchResults(res.data.data);
      setActiveTab('search');
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleVerifyPhone = async (phoneId, status) => {
    try {
      await adminAPI.verifyPhone(phoneId, { verificationStatus: status });
      alert(`Phone ${status} successfully!`);
      loadDashboardData();
    } catch (error) {
      console.error('Error verifying phone:', error);
      alert('Failed to verify phone');
    }
  };

  const handleViewUser = async (user) => {
    try {
      setSelectedUser(user);
      setActiveTab('user-detail');
      
      // Load user's phones, bids, and transactions
      const [phonesRes, bidsRes, transactionsRes] = await Promise.all([
        adminAPI.getAllPhones({ sellerId: user._id }),
        adminAPI.getAllBids({ bidderId: user._id }),
        adminAPI.getAllTransactions({ userId: user._id })
      ]);
      
      setUserPhones(phonesRes.data.data || []);
      setUserBids(bidsRes.data.data || []);
      setUserTransactions(transactionsRes.data.data || []);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const handleReviewKYC = async (userId, status) => {
    try {
      await adminAPI.reviewKYC(userId, status);
      loadDashboardData();
    } catch (error) {
      console.error('Error reviewing KYC:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by ID (real or anonymous)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'users', 'phones', 'transactions', 'search'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedUser(null);
                }}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
            {activeTab === 'user-detail' && selectedUser && (
              <button
                onClick={() => setActiveTab('users')}
                className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                ← Back to Users
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.users.total} subtitle={`${stats.users.buyers} users, ${stats.users.sellers} sellers`} />
              <StatCard title="Total Phones" value={stats.phones.total} subtitle={`${stats.phones.live} live, ${stats.phones.pending} pending`} />
              <StatCard title="Active Auctions" value={stats.auctions.active} subtitle={`${stats.auctions.total} total`} />
              <StatCard title="Total Bids" value={stats.bids.total} subtitle={`${stats.bids.winning} winning`} />
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Platform Commission</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.revenue.totalPlatformCommission.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seller Payouts</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.revenue.totalSellerPayouts.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transaction Value</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.revenue.totalTransactionValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* KYC Pending */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">KYC Pending Review ({stats.users.kycPending})</h3>
              <p className="text-gray-600">Users waiting for KYC verification</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anonymous ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.anonymousId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{user.walletBalance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        {user.kycStatus === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReviewKYC(user._id, 'verified');
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve KYC
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReviewKYC(user._id, 'rejected');
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject KYC
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'phones' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller (Anonymous)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IMEI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {phones.map((phone) => (
                  <tr key={phone._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{phone.brand} {phone.model}</div>
                      <div className="text-sm text-gray-500">{phone.storage} • {phone.condition}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phone.anonymousSellerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{phone.imei}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        phone.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        phone.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {phone.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {phone.verificationStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyPhone(phone._id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyPhone(phone._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escrow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{transaction._id.slice(-8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.sellerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.buyerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{transaction.finalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.escrowStatus === 'released' ? 'bg-green-100 text-green-800' :
                        transaction.escrowStatus === 'refunded' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.escrowStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.meetingStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.meetingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'user-detail' && selectedUser && (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-blue-600 mt-1">Anonymous ID: {selectedUser.anonymousId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedUser.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    selectedUser.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    KYC: {selectedUser.kycStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Wallet Balance</p>
                  <p className="text-2xl font-bold text-blue-600">₹{selectedUser.walletBalance || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Phones Listed</p>
                  <p className="text-2xl font-bold text-green-600">{userPhones.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Bids Placed</p>
                  <p className="text-2xl font-bold text-purple-600">{userBids.length}</p>
                </div>
              </div>
            </div>

            {/* Phones Sold by User */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Phones Listed for Sale ({userPhones.length})</h3>
              {userPhones.length === 0 ? (
                <p className="text-gray-500">No phones listed yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPhones.map(phone => (
                    <div key={phone._id} className="border rounded-lg p-4">
                      {phone.images?.[0] && (
                        <img src={phone.images[0]} alt={phone.model} className="w-full h-32 object-cover rounded mb-2" />
                      )}
                      <h4 className="font-semibold">{phone.brand} {phone.model}</h4>
                      <p className="text-sm text-gray-600">{phone.storage} • {phone.condition}</p>
                      <p className="text-sm text-gray-500 mt-1">IMEI: {phone.imei}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">₹{phone.minBidPrice}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          phone.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          phone.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {phone.verificationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bids Placed by User */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Bids Placed ({userBids.length})</h3>
              {userBids.length === 0 ? (
                <p className="text-gray-500">No bids placed yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Auction ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Bid Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userBids.map(bid => (
                        <tr key={bid._id}>
                          <td className="px-4 py-2 text-sm">{bid.auctionId}</td>
                          <td className="px-4 py-2 text-sm font-bold text-blue-600">₹{bid.bidAmount}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {bid.isWinning ? 'Winning' : 'Outbid'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(bid.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Transactions ({userTransactions.length})</h3>
              {userTransactions.length === 0 ? (
                <p className="text-gray-500">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {userTransactions.map(transaction => (
                    <div key={transaction._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Transaction ID: {transaction._id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">Amount: ₹{transaction.finalAmount}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            transaction.escrowStatus === 'released' ? 'bg-green-100 text-green-800' :
                            transaction.escrowStatus === 'refunded' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.escrowStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && searchResults && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Search Results for: {searchQuery}</h3>
            
            {searchResults.users.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-4">Users ({searchResults.users.length})</h4>
                {searchResults.users.map(user => (
                  <div key={user._id} className="border-b py-2 flex justify-between items-center">
                    <div>
                      <p><strong>Name:</strong> {user.name}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Anonymous ID:</strong> {user.anonymousId}</p>
                    </div>
                    <button
                      onClick={() => handleViewUser(user)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.phones.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-4">Phones ({searchResults.phones.length})</h4>
                {searchResults.phones.map(phone => (
                  <div key={phone._id} className="border-b py-2">
                    <p><strong>Model:</strong> {phone.brand} {phone.model}</p>
                    <p><strong>Seller:</strong> {phone.anonymousSellerId}</p>
                    <p><strong>IMEI:</strong> {phone.imei}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
  </div>
);

export default AdminDashboard;
