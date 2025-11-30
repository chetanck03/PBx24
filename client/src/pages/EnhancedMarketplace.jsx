import { useState, useEffect } from 'react';
import { phoneAPI, auctionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EnhancedMarketplace = () => {
  const [phones, setPhones] = useState([]);
  const [trendingPhones, setTrendingPhones] = useState([]);
  const [auctions, setAuctions] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // 'all' or 'trending'
  const [filters, setFilters] = useState({
    brand: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadPhones();
  }, [filters]);

  const loadPhones = async () => {
    try {
      setLoading(true);
      const res = await phoneAPI.getAllPhones({
        status: 'live',
        ...filters
      });
      const allPhones = res.data.data;
      setPhones(allPhones);
      
      // Load auctions for each phone
      const auctionPromises = allPhones.map(phone => 
        auctionAPI.getAuctionByPhoneId(phone._id).catch(() => null)
      );
      const auctionResults = await Promise.all(auctionPromises);
      
      const auctionMap = {};
      auctionResults.forEach((result, index) => {
        if (result?.data?.data) {
          auctionMap[allPhones[index]._id] = result.data.data;
        }
      });
      setAuctions(auctionMap);
      
      // Calculate trending phones (most bids in last 24 hours)
      const trending = allPhones
        .map(phone => ({
          ...phone,
          auction: auctionMap[phone._id],
          bidVelocity: auctionMap[phone._id]?.totalBids || 0
        }))
        .filter(p => p.auction && p.auction.status === 'active')
        .sort((a, b) => b.bidVelocity - a.bidVelocity)
        .slice(0, 6);
      
      setTrendingPhones(trending);
    } catch (error) {
      console.error('Error loading phones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Phone Marketplace</h1>
          <p className="mt-2 text-gray-600">Browse and bid on phones anonymously</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveView('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeView === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Phones ({phones.length})
          </button>
          <button
            onClick={() => setActiveView('trending')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeView === 'trending'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔥 Trending Deals ({trendingPhones.length})
          </button>
        </div>

        {/* Trending Banner */}
        {activeView === 'trending' && trendingPhones.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🔥</span>
              <h2 className="text-2xl font-bold text-gray-900">Hot Deals - Bidding Fast!</h2>
            </div>
            <p className="text-gray-600">These phones are getting the most bids right now. Don't miss out!</p>
          </div>
        )}

        {/* Filters */}
        {activeView === 'all' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Google">Google</option>
                <option value="OnePlus">OnePlus</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="₹0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="₹100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          </div>
        )}

        {/* Phone Grid */}
        {(activeView === 'all' ? phones : trendingPhones).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {activeView === 'trending' ? 'No trending phones at the moment' : 'No phones available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeView === 'all' ? phones : trendingPhones).map((phone) => {
              const auction = auctions[phone._id];
              return (
                <div
                  key={phone._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => navigate(`/phone/${phone._id}`)}
                >
                  {/* Image */}
                  <div className="relative h-64 bg-gray-200">
                    {phone.images && phone.images[0] ? (
                      <img
                        src={phone.images[0]}
                        alt={`${phone.brand} ${phone.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    
                    {/* Condition Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        phone.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                        phone.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        phone.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {phone.condition}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {phone.brand} {phone.model}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Storage:</span> {phone.storage}
                      </p>
                      {phone.ram && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">RAM:</span> {phone.ram}
                        </p>
                      )}
                      {phone.color && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Color:</span> {phone.color}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Seller:</span> {phone.anonymousSellerId}
                      </p>
                    </div>

                    {/* Auction Info */}
                    {auction && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Current Bid:</span>
                          <span className="text-lg font-bold text-blue-600">
                            ₹{auction.currentBid || phone.minBidPrice}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Bids:</span>
                          <span className="text-sm font-medium">{auction.totalBids}</span>
                        </div>
                        
                        {auction.anonymousLeadingBidder && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Leading Bidder:</span>
                            <span className="text-sm font-medium text-green-600">
                              {auction.anonymousLeadingBidder}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Time Remaining:</span>
                          <span className="text-sm font-medium text-red-600">
                            {getTimeRemaining(auction.auctionEndTime)}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/phone/${phone._id}`);
                      }}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      View Details & Bid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMarketplace;
