import { useNavigate } from 'react-router-dom';
import { Smartphone, CheckCircle, ExternalLink, Eye } from 'lucide-react';

const SoldPhonesTab = ({ soldPhones, onViewUser, StatusBadge }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      {soldPhones.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center">
          <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No phones have been sold yet</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-gray-500 text-xs">Total Sold</p>
              <p className="text-2xl font-bold text-[#c4ff0d]">{soldPhones.length}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-gray-500 text-xs">Total Revenue</p>
              <p className="text-2xl font-bold text-green-500">₹{soldPhones.reduce((sum, p) => sum + (p.saleAmount || p.finalBidAmount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-gray-500 text-xs">Platform Commission</p>
              <p className="text-2xl font-bold text-blue-500">₹{soldPhones.reduce((sum, p) => sum + (p.platformCommission || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-gray-500 text-xs">Seller Payouts</p>
              <p className="text-2xl font-bold text-purple-500">₹{soldPhones.reduce((sum, p) => sum + (p.sellerPayout || 0), 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {soldPhones.map((phone) => (
              <div key={phone._id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex gap-3 mb-3">
                  {phone.images?.[0] ? (
                    <img src={phone.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <button 
                      onClick={() => navigate(`/phone/${phone._id}`)}
                      className="text-white font-medium truncate hover:text-[#c4ff0d] flex items-center gap-1"
                    >
                      {phone.brand} {phone.model}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <p className="text-gray-500 text-xs">{phone.storage} - {phone.condition}</p>
                    <p className="text-[#c4ff0d] font-bold mt-1">₹{(phone.saleAmount || phone.finalBidAmount || phone.minBidPrice)?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#1a1a1a] rounded-lg p-2">
                    <p className="text-gray-500 text-xs mb-1">Seller</p>
                    {phone.sellerDetails ? (
                      <button 
                        onClick={() => onViewUser(phone.sellerDetails)}
                        className="text-blue-400 text-sm hover:underline truncate block w-full text-left"
                      >
                        {phone.sellerDetails.name}
                      </button>
                    ) : (
                      <p className="text-gray-400 text-sm">Unknown</p>
                    )}
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-2">
                    <p className="text-gray-500 text-xs mb-1">Buyer</p>
                    {phone.buyerDetails ? (
                      <button 
                        onClick={() => onViewUser(phone.buyerDetails)}
                        className="text-green-400 text-sm hover:underline truncate block w-full text-left"
                      >
                        {phone.buyerDetails.name}
                      </button>
                    ) : (
                      <p className="text-gray-400 text-sm">Unknown</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {phone.escrowStatus && <StatusBadge status={phone.escrowStatus} />}
                    {phone.meetingStatus && <StatusBadge status={phone.meetingStatus} />}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {phone.soldAt ? new Date(phone.soldAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Seller</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Buyer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Sale Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Commission</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Sold Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {soldPhones.map((phone) => (
                    <tr key={phone._id} className="hover:bg-[#1a1a1a]/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {phone.images?.[0] ? (
                            <img src={phone.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <button 
                              onClick={() => navigate(`/phone/${phone._id}`)}
                              className="text-white font-medium hover:text-[#c4ff0d] flex items-center gap-1"
                            >
                              {phone.brand} {phone.model}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <p className="text-gray-500 text-sm">{phone.storage} - {phone.condition}</p>
                            <p className="text-gray-600 text-xs font-mono">ID: {phone._id?.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {phone.sellerDetails ? (
                          <div>
                            <button 
                              onClick={() => onViewUser(phone.sellerDetails)}
                              className="text-blue-400 font-medium hover:underline flex items-center gap-1"
                            >
                              {phone.sellerDetails.name}
                              <Eye className="w-3 h-3" />
                            </button>
                            <p className="text-gray-500 text-xs">{phone.sellerDetails.email}</p>
                            <p className="text-gray-600 text-xs font-mono">{phone.sellerDetails.anonymousId}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {phone.buyerDetails ? (
                          <div>
                            <button 
                              onClick={() => onViewUser(phone.buyerDetails)}
                              className="text-green-400 font-medium hover:underline flex items-center gap-1"
                            >
                              {phone.buyerDetails.name}
                              <Eye className="w-3 h-3" />
                            </button>
                            <p className="text-gray-500 text-xs">{phone.buyerDetails.email}</p>
                            <p className="text-gray-600 text-xs font-mono">{phone.buyerDetails.anonymousId}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#c4ff0d] font-bold">₹{(phone.saleAmount || phone.finalBidAmount || phone.minBidPrice)?.toLocaleString()}</p>
                        {phone.totalBids > 0 && (
                          <p className="text-gray-500 text-xs">{phone.totalBids} bids</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-green-500 font-medium">₹{(phone.platformCommission || 0).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">Payout: ₹{(phone.sellerPayout || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {phone.escrowStatus && <StatusBadge status={phone.escrowStatus} />}
                          {phone.meetingStatus && <StatusBadge status={phone.meetingStatus} />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">
                          {phone.soldAt ? new Date(phone.soldAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {phone.soldAt ? new Date(phone.soldAt).toLocaleTimeString() : ''}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SoldPhonesTab;
