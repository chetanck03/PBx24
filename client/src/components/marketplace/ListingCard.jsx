import { Link } from 'react-router-dom';
import { Clock, DollarSign, User } from 'lucide-react';

const ListingCard = ({ listing }) => {
  const timeRemaining = () => {
    const now = new Date();
    const endTime = new Date(listing.auctionEndTime);
    const diff = endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      'good': 'bg-yellow-100 text-yellow-800',
      'fair': 'bg-orange-100 text-orange-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Link to={`/listing/${listing._id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
        {/* Image */}
        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Title and Brand */}
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {listing.brand} {listing.model}
          </p>

          {/* Condition */}
          <div className="mb-3">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(listing.condition)}`}>
              {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
            </span>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Current Bid</p>
              <p className="font-bold text-lg text-green-600">
                ${listing.currentHighestBid || listing.startingPrice}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Starting</p>
              <p className="text-sm text-gray-700">
                ${listing.startingPrice}
              </p>
            </div>
          </div>

          {/* Time and Seller */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{timeRemaining()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span className="truncate max-w-20">
                {listing.seller?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;