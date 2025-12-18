import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Eye, Check, X, Trash2, RefreshCw } from 'lucide-react';

const PhonesTab = ({ phones, onVerify, onDelete, onRefresh, StatusBadge }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };
  
  const activePhones = phones.filter(phone => phone.status !== 'sold');
  
  const filteredPhones = filter === 'all' 
    ? activePhones 
    : activePhones.filter(phone => phone.verificationStatus === filter);
  
  const pendingCount = activePhones.filter(p => p.verificationStatus === 'pending').length;
  const approvedCount = activePhones.filter(p => p.verificationStatus === 'approved').length;
  const rejectedCount = activePhones.filter(p => p.verificationStatus === 'rejected').length;
  
  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-[#c4ff0d] text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}
        >
          All ({activePhones.length})
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pending' ? 'bg-yellow-500 text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}
        >
          🔔 Pending ({pendingCount})
        </button>
        <button 
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'approved' ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}
        >
          Approved ({approvedCount})
        </button>
        <button 
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}
        >
          Rejected ({rejectedCount})
        </button>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="ml-auto px-4 py-2 bg-[#1a1a1a] text-gray-400 hover:text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {filteredPhones.length === 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-8 text-center">
          <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No phones found with status: {filter}</p>
        </div>
      )}
      
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredPhones.map((phone) => (
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
                <p className="text-white font-medium truncate">{phone.brand} {phone.model}</p>
                <p className="text-gray-500 text-xs">{phone.storage} - {phone.condition}</p>
                <p className="text-[#c4ff0d] font-bold mt-1">₹{phone.minBidPrice?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={phone.verificationStatus} />
              <div className="flex gap-2">
                <button onClick={() => navigate(`/phone/${phone._id}`)} className="p-2 bg-blue-500/20 rounded-lg" title="View Phone Details">
                  <Eye className="w-4 h-4 text-blue-400" />
                </button>
                {phone.verificationStatus === 'pending' && (
                  <>
                    <button onClick={() => onVerify(phone._id, 'approved')} className="p-2 bg-green-500/20 rounded-lg"><Check className="w-4 h-4 text-green-400" /></button>
                    <button onClick={() => onVerify(phone._id, 'rejected')} className="p-2 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                  </>
                )}
                <button onClick={() => onDelete(phone._id, `${phone.brand} ${phone.model}`)} className="p-2 bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {filteredPhones.map((phone) => (
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
                        <p className="text-white font-medium">{phone.brand} {phone.model}</p>
                        <p className="text-gray-500 text-sm">{phone.storage} - {phone.condition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">{phone.anonymousSellerId?.slice(0, 12)}...</td>
                  <td className="px-6 py-4 text-white font-medium">₹{phone.minBidPrice?.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={phone.verificationStatus} /></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/phone/${phone._id}`)} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg" title="View Phone Details">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                      {phone.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => onVerify(phone._id, 'approved')} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"><Check className="w-4 h-4 text-green-400" /></button>
                          <button onClick={() => onVerify(phone._id, 'rejected')} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                        </>
                      )}
                      <button onClick={() => onDelete(phone._id, `${phone.brand} ${phone.model}`)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PhonesTab;
