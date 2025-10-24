import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import config from '../config/env.js';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Package, Gavel, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myListings: 0,
    myBids: 0,
    activeBids: 0,
    wonBids: 0
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's listings
      const listingsResponse = await api.get(config.endpoints.listings.myListings);
      const listings = listingsResponse.data.success ? listingsResponse.data.data.listings : [];
      
      // Fetch user's bids
      const bidsResponse = await api.get(config.endpoints.bids.myBids);
      const bids = bidsResponse.data.success ? bidsResponse.data.data.bids : [];

      // Calculate stats
      const activeBids = bids.filter(bid => bid.status === 'winning' || bid.status === 'active').length;
      const wonBids = bids.filter(bid => bid.status === 'selected').length;

      setStats({
        myListings: listings.length,
        myBids: bids.length,
        activeBids,
        wonBids
      });

      setRecentListings(listings.slice(0, 3));
      setRecentBids(bids.slice(0, 3));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'My Listings',
      value: stats.myListings,
      icon: Package,
      color: 'bg-blue-500',
      link: '/my-listings'
    },
    {
      title: 'My Bids',
      value: stats.myBids,
      icon: Gavel,
      color: 'bg-green-500',
      link: '/my-bids'
    },
    {
      title: 'Active Bids',
      value: stats.activeBids,
      icon: TrendingUp,
      color: 'bg-yellow-500'
    },
    {
      title: 'Won Bids',
      value: stats.wonBids,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your listings and bids
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/create-listing"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Listing
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Gavel className="h-5 w-5 mr-2" />
              Browse Marketplace
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Listings
              </h2>
              <Link
                to="/my-listings"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
            {recentListings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No listings yet. Create your first listing!
              </p>
            ) : (
              <div className="space-y-3">
                {recentListings.map((listing) => (
                  <div key={listing._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {listing.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {listing.bidCount || 0} bids • ${listing.currentHighestBid || listing.startingPrice}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bids */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Bids
              </h2>
              <Link
                to="/my-bids"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
            {recentBids.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No bids yet. Start bidding on phones!
              </p>
            ) : (
              <div className="space-y-3">
                {recentBids.map((bid) => (
                  <div key={bid._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {bid.listing?.title || 'Unknown Listing'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Your bid: ${bid.amount}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      bid.status === 'winning' ? 'bg-green-100 text-green-800' :
                      bid.status === 'selected' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;