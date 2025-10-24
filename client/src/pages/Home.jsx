import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Users, Shield, Zap } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Smartphone,
      title: 'Quality Phones',
      description: 'Browse through verified phone listings with detailed specifications'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Connect with verified buyers and sellers in a secure environment'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'All transactions are monitored and protected by our admin team'
    },
    {
      icon: Zap,
      title: 'Real-time Bidding',
      description: 'Get instant notifications and updates on your bids and listings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Buy & Sell Phones
              <br />
              <span className="text-yellow-300">Through Bidding</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The marketplace where you can auction your phone or bid on others
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Phones
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/create-listing"
                  className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  Sell Your Phone
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PhoneBid?
            </h2>
            <p className="text-xl text-gray-600">
              The best platform for phone auctions with features you'll love
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users buying and selling phones through auctions
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;