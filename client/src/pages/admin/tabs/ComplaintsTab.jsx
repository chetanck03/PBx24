import { useState } from 'react';
import { MessageSquare, ExternalLink, X } from 'lucide-react';

const ComplaintsTab = ({ complaints, onUpdate, StatusBadge }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  const handleUpdateWithResponse = async (complaintId, status, response) => {
    await onUpdate(complaintId, status, response);
    setSelectedComplaint(null);
    setAdminResponse('');
  };

  return (
    <div className="space-y-3 lg:space-y-4">
      {complaints.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center">
          <MessageSquare className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No complaints found</p>
        </div>
      ) : complaints.map((complaint) => (
        <div key={complaint._id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 lg:mb-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-lg mb-1">{complaint.subject}</h4>
              <div className="flex flex-wrap items-center gap-2 text-xs lg:text-sm text-gray-500">
                <span>From: {complaint.userId?.anonymousId || complaint.userId?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{complaint.userEmail}</span>
                <span>•</span>
                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={complaint.status} />
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                complaint.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                complaint.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                complaint.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {complaint.priority?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Category and Description */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-[#c4ff0d]/20 text-[#c4ff0d] rounded text-xs font-medium">
                {complaint.category?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {/* Proof/Evidence */}
          {complaint.proof && (
            <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg">
              <p className="text-gray-400 text-xs mb-2">Evidence/Proof:</p>
              <a 
                href={complaint.proof} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#c4ff0d] text-sm hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View Evidence
              </a>
            </div>
          )}

          {/* Admin Response */}
          {complaint.adminResponse && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-xs font-bold mb-1">Admin Response:</p>
              <p className="text-gray-300 text-sm">{complaint.adminResponse}</p>
            </div>
          )}

          {/* Action Buttons */}
          {complaint.status !== 'resolved' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => onUpdate(complaint._id, 'in_progress', '')} 
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm transition"
              >
                Mark In Progress
              </button>
              <button 
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setAdminResponse('');
                }} 
                className="flex-1 sm:flex-none px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm transition"
              >
                Resolve with Response
              </button>
              <button 
                onClick={() => onUpdate(complaint._id, 'resolved', 'Issue resolved by admin')} 
                className="flex-1 sm:flex-none px-4 py-2 bg-[#c4ff0d]/20 text-[#c4ff0d] rounded-lg hover:bg-[#c4ff0d]/30 text-sm transition"
              >
                Quick Resolve
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Admin Response Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Resolve Complaint</h3>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-[#1a1a1a] rounded-lg">
              <h4 className="text-white font-medium mb-2">{selectedComplaint.subject}</h4>
              <p className="text-gray-400 text-sm">{selectedComplaint.description}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Response
              </label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg focus:border-[#c4ff0d] focus:outline-none transition"
                rows={4}
                placeholder="Provide a detailed response to the user..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#3a3a3a] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateWithResponse(selectedComplaint._id, 'resolved', adminResponse)}
                className="flex-1 px-4 py-2 bg-[#c4ff0d] text-black font-medium rounded-lg hover:bg-[#a8d60d] transition"
                disabled={!adminResponse.trim()}
              >
                Resolve Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsTab;
