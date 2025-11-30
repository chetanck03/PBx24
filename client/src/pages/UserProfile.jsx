import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, phoneAPI, bidAPI } from '../services/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ phones: 0, bids: 0, won: 0 });
  const [activeTab, setActiveTab] = useState('selling');
  const [myPhones, setMyPhones] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [userRes, phonesRes, bidsRes] = await Promise.all([
        userAPI.getProfile(),
        phoneAPI.getSellerPhones().catch(() => ({ data: { data: [] } })),
        bidAPI.getUserBids().catch(() => ({ data: { data: [] } }))
      ]);
      
      const userData = userRes.data.data;
      setUser(userData);
      setProfileData({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
      
      const phones = phonesRes.data.data;
      const bids = bidsRes.data.data;
      setMyPhones(phones);
      setMyBids(bids);
      
      setStats({
        phones: phones.length,
        bids: bids.length,
        won: bids.filter(b => b.isWinning).length
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(profileData);
      setEditMode(false);
      loadProfileData();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="flex items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">ID: {user?.anonymousId}</p>
              </div>
              <div className="ml-auto mb-4">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">₹{user?.walletBalance || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Wallet Balance</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.phones}</p>
                <p className="text-sm text-gray-600 mt-1">Phones Listed</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.bids}</p>
                <p className="text-sm text-gray-600 mt-1">Bids Placed</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.won}</p>
                <p className="text-sm text-gray-600 mt-1">Auctions Won</p>
              </div>
            </div>

            {/* Edit Form */}
            {editMode && (
              <form onSubmit={handleUpdateProfile} className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* KYC Status */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KYC Verification Status</p>
                <p className="text-lg font-semibold mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user?.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    user?.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.kycStatus?.toUpperCase()}
                  </span>
                </p>
              </div>
              {user?.kycStatus !== 'verified' && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Complete KYC
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('selling')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'selling'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Listings ({stats.phones})
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'buying'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Bids ({stats.bids})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'selling' && (
              <div>
                {myPhones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't listed any phones yet</p>
                    <button
                      onClick={() => navigate('/create-listing')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Selling
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPhones.map((phone) => (
                      <div
                        key={phone._id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                        onClick={() => navigate(`/phone/${phone._id}`)}
                      >
                        <div className="h-48 bg-gray-200">
                          {phone.images?.[0] && (
                            <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{phone.brand} {phone.model}</h3>
                          <p className="text-sm text-gray-600">{phone.storage} • {phone.condition}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              phone.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              phone.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {phone.verificationStatus}
                            </span>
                            <span className="text-lg font-bold text-blue-600">₹{phone.minBidPrice}</span>
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
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't placed any bids yet</p>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBids.map((bid) => (
                      <div key={bid._id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Auction: {bid.auctionId}</p>
                            <p className="text-sm text-gray-600">Bid Amount: ₹{bid.bidAmount}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(bid.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {bid.isWinning ? '🏆 Winning' : 'Outbid'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
