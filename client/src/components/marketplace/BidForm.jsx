import { useState } from 'react';
import api from '../../config/api';
import config from '../../config/env.js';
import LoadingSpinner from '../common/LoadingSpinner';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const BidForm = ({ listingId, currentHighestBid, onBidPlaced }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const minBidAmount = currentHighestBid + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(bidAmount);
    if (amount < minBidAmount) {
      toast.error(`Bid must be at least $${minBidAmount}`);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(config.endpoints.bids.base, {
        listingId,
        amount
      });

      if (response.data.success) {
        toast.success('Bid placed successfully!');
        setBidAmount('');
        onBidPlaced(response.data.data.bid);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to place bid';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Bid Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            min={minBidAmount}
            step="1"
            required
            placeholder={minBidAmount.toString()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Minimum bid: ${minBidAmount}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !bidAmount}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Placing Bid...
          </>
        ) : (
          'Place Bid'
        )}
      </button>
    </form>
  );
};

export default BidForm;