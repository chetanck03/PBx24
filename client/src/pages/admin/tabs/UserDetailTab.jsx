import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Video, Play, Trash2, Eye, UserCheck, X, ZoomIn, ExternalLink } from 'lucide-react';

// Full-screen Image Viewer Modal
const ImageViewerModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      
      {/* Open in new tab button */}
      <a 
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-16 p-2 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
      >
        <ExternalLink className="w-6 h-6 text-white" />
      </a>
      
      {/* Image */}
      <img 
        src={imageUrl} 
        alt="Government ID Full View" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const UserDetailTab = ({ user, phones, bids, reels, onBack, onDeleteReel, onDeleteUser }) => {
  const navigate = useNavigate();
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  if (!user) return null;
  
  const totalViews = user.totalReelViews || reels.reduce((sum, reel) => sum + (reel.views || 0), 0);
  
  return (
    <div className="space-y-4 lg:space-y-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Users
      </button>
      
      {/* User Info Card */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#c4ff0d] to-[#a8d60d] rounded-full flex items-center justify-center text-black text-xl lg:text-2xl font-bold flex-shrink-0">
              {user.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg lg:text-2xl font-bold text-white truncate">{user.name}</h2>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
              <p className="text-[#c4ff0d] text-xs lg:text-sm mt-1">ID: {user.anonymousId}</p>
              <p className="text-gray-500 text-xs mt-1">User ID: {user._id}</p>
            </div>
          </div>
          <button 
            onClick={() => onDeleteUser(user._id, user.name)} 
            className="w-full sm:w-auto px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
          >
            Delete User
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 lg:gap-4 mt-4 lg:mt-6">
          <div className="bg-[#1a1a1a] rounded-lg lg:rounded-xl p-3 lg:p-4 text-center">
            <p className="text-gray-500 text-xs">Wallet</p>
            <p className="text-lg lg:text-2xl font-bold text-[#c4ff0d]">₹{user.walletBalance || 0}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg lg:rounded-xl p-3 lg:p-4 text-center">
            <p className="text-gray-500 text-xs">Phones</p>
            <p className="text-lg lg:text-2xl font-bold text-white">{phones.length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg lg:rounded-xl p-3 lg:p-4 text-center">
            <p className="text-gray-500 text-xs">Bids</p>
            <p className="text-lg lg:text-2xl font-bold text-white">{bids.length}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:gap-4 mt-2 lg:mt-4">
          <div className="bg-[#1a1a1a] rounded-lg lg:rounded-xl p-3 lg:p-4 text-center">
            <p className="text-gray-500 text-xs">Reels</p>
            <p className="text-lg lg:text-2xl font-bold text-red-500">{reels.length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg lg:rounded-xl p-3 lg:p-4 text-center">
            <p className="text-gray-500 text-xs">Total Reel Views</p>
            <p className="text-lg lg:text-2xl font-bold text-purple-500">{totalViews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Government ID Section */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <h3 className="text-white font-semibold mb-3 lg:mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-400" />
          Government ID Verification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">ID Type</p>
            <p className="text-white font-medium">{user.governmentIdType || 'Not provided'}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">KYC Status</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' :
              user.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{user.kycStatus}</span>
          </div>
        </div>
        {user.governmentIdProof && (
          <div className="mt-4">
            <p className="text-gray-500 text-xs mb-2">Government ID Document</p>
            <div 
              className="bg-[#1a1a1a] rounded-xl p-3 inline-block cursor-pointer hover:bg-[#252525] transition group relative"
              onClick={() => setShowImageViewer(true)}
            >
              <img 
                src={user.governmentIdProof} 
                alt="Government ID" 
                className="max-w-full max-h-80 rounded-lg object-contain"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-2 bg-[#c4ff0d] text-black px-4 py-2 rounded-lg font-medium">
                  <ZoomIn className="w-5 h-5" />
                  View Full Size
                </div>
              </div>
            </div>
            <p className="text-[#c4ff0d] text-xs mt-2 flex items-center gap-1">
              <ZoomIn className="w-3 h-3" />
              Click image to view full size
            </p>
          </div>
        )}
        {!user.governmentIdProof && (
          <div className="mt-4 bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm">No government ID document uploaded</p>
          </div>
        )}
      </div>

      {/* User Phones */}
      {phones.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-white font-semibold mb-3 lg:mb-4">Phones ({phones.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {phones.map((phone) => (
              <div 
                key={phone._id} 
                className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4 flex gap-3 cursor-pointer hover:bg-[#252525] hover:border-[#c4ff0d] border border-transparent transition-all"
                onClick={() => navigate(`/phone/${phone._id}`)}
              >
                {phone.images?.[0] && (
                  <img src={phone.images[0]} alt="" className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm truncate">{phone.brand} {phone.model}</p>
                  <p className="text-gray-500 text-xs">{phone.storage}</p>
                  <p className="text-[#c4ff0d] font-medium text-sm mt-1">₹{phone.minBidPrice?.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      phone.verificationStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                      phone.verificationStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{phone.verificationStatus}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      phone.status === 'live' ? 'bg-blue-500/20 text-blue-400' :
                      phone.status === 'sold' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{phone.status}</span>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Reels */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <Video className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
          <h3 className="text-white font-semibold">Reels ({reels.length})</h3>
        </div>
        {reels.length === 0 ? (
          <div className="text-center py-6 lg:py-8">
            <Video className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No reels</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {reels.map((reel) => (
              <div key={reel._id} className="relative group">
                <div className="aspect-[9/16] bg-[#1a1a1a] rounded-lg lg:rounded-xl overflow-hidden">
                  <img src={reel.thumbnailUrl} alt="Reel" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="p-2 lg:p-3 bg-white/20 rounded-full">
                      <Play className="w-4 h-4 lg:w-6 lg:h-6 text-white" fill="white" />
                    </a>
                  </div>
                </div>
                <div className="mt-1 lg:mt-2 flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{reel.views || 0} views</span>
                  <button onClick={() => onDeleteReel(reel._id)} className="p-1 bg-red-500/20 rounded">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewerModal 
          imageUrl={user.governmentIdProof} 
          onClose={() => setShowImageViewer(false)} 
        />
      )}
    </div>
  );
};

export default UserDetailTab;
