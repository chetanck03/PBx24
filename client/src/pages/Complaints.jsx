import { useState, useEffect } from 'react';
import axios from 'axios';

import toast from 'react-hot-toast';
import { 
  MessageSquare, Send, X, FileText, Mail, Tag, 
  Paperclip, AlertTriangle, User
} from 'lucide-react';
import config from '../config/env.js';

const API_URL = config.API_BASE_URL;

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    userEmail: '',
    proof: '',
    category: 'other',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/complaints/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description || !formData.userEmail) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/complaints`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Complaint submitted successfully! Admin will review it soon.');
      setShowCreateModal(false);
      setFormData({
        subject: '',
        description: '',
        userEmail: '',
        proof: '',
        category: 'other',
        priority: 'medium'
      });
      loadComplaints();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4ff0d] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Container with border */}
        <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Complaints
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] font-bold transition-all"
            >
              <span>+</span>
              New Complaint
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
            <div className="bg-[#1a1a1a] border-2 border-[#c4ff0d] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Pending</div>
              <p className="text-xl sm:text-3xl font-bold text-[#c4ff0d]">
                {complaints.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border-2 border-[#c4ff0d] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">In Progress</div>
              <p className="text-xl sm:text-3xl font-bold text-[#c4ff0d]">
                {complaints.filter(c => c.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border-2 border-[#c4ff0d] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Resolved</div>
              <p className="text-xl sm:text-3xl font-bold text-[#c4ff0d]">
                {complaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total</div>
              <p className="text-xl sm:text-3xl font-bold text-white">
                {complaints.length}
              </p>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-gray-400 mb-6">Submit and track your complaints</p>

          {/* Complaints List */}
          {complaints.length === 0 ? (
            <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-[#c4ff0d]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Complaints Yet</h3>
              <p className="text-gray-400 mb-6">
                If you face any issues, feel free to reach out to us.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] font-bold transition-all"
              >
                <Send className="w-5 h-5" />
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div 
                  key={complaint._id} 
                  className="bg-[#1a1a1a] border-2 border-[#c4ff0d] rounded-xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex-1">
                      {/* Title and Status */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{complaint.subject}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          complaint.status === 'pending' ? 'bg-[#c4ff0d] text-black' :
                          complaint.status === 'in_progress' ? 'bg-blue-500 text-white' :
                          complaint.status === 'resolved' ? 'bg-green-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {complaint.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                        {complaint.status === 'pending' && (
                          <span className="text-yellow-500">⚠</span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-2">{complaint.description}</p>

                      {/* Email */}
                      <p className="text-gray-500 text-sm mb-2">{complaint.userEmail}</p>

                      {/* Priority and Category */}
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-sm ${
                          complaint.priority === 'urgent' ? 'text-red-500' :
                          complaint.priority === 'high' ? 'text-orange-500' :
                          complaint.priority === 'medium' ? 'text-[#c4ff0d]' :
                          'text-gray-400'
                        }`}>
                          {complaint.priority?.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <User className="w-4 h-4" />
                          {complaint.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Date */}
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Proof Link */}
                  {complaint.proof && (
                    <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                      <a 
                        href={complaint.proof} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-[#c4ff0d] text-sm hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        View Proof/Evidence
                      </a>
                    </div>
                  )}

                  {/* Admin Response */}
                  {complaint.adminResponse && (
                    <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                      <div className="bg-[#c4ff0d]/10 border border-[#c4ff0d] rounded-lg p-3">
                        <p className="text-[#c4ff0d] text-xs font-bold mb-1">Admin Response:</p>
                        <p className="text-gray-300 text-sm">{complaint.adminResponse}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Complaint Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-[#0f0f0f] p-6 border-b border-[#2a2a2a]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c4ff0d] rounded-lg flex items-center justify-center">
                      <Send className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Submit New Complaint</h2>
                      <p className="text-gray-400 text-sm">We'll review within 24-48 hours</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-8 h-8 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Topic / Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] text-white rounded-xl focus:border-[#c4ff0d] focus:outline-none transition"
                      placeholder="Brief description of your complaint"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        value={formData.userEmail}
                        onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] text-white rounded-xl focus:border-[#c4ff0d] focus:outline-none transition"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] text-white rounded-xl focus:border-[#c4ff0d] focus:outline-none transition"
                        required
                      >
                        <option value="bidding">Bidding Issue</option>
                        <option value="payment">Payment Issue</option>
                        <option value="phone_quality">Phone Quality</option>
                        <option value="seller_issue">Seller Issue</option>
                        <option value="buyer_issue">Buyer Issue</option>
                        <option value="technical">Technical Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Priority
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['low', 'medium', 'high', 'urgent'].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority })}
                          className={`py-2 rounded-lg font-semibold text-sm transition border-2 ${
                            formData.priority === priority
                              ? priority === 'urgent' ? 'bg-red-500 text-white border-red-500' :
                                priority === 'high' ? 'bg-orange-500 text-white border-orange-500' :
                                priority === 'medium' ? 'bg-[#c4ff0d] text-black border-[#c4ff0d]' :
                                'bg-gray-500 text-white border-gray-500'
                              : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#3a3a3a]'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] text-white rounded-xl focus:border-[#c4ff0d] focus:outline-none transition"
                      rows={4}
                      placeholder="Provide detailed information about your complaint..."
                      required
                    />
                  </div>

                  {/* Proof */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Proof / Evidence (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.proof}
                      onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] text-white rounded-xl focus:border-[#c4ff0d] focus:outline-none transition"
                      placeholder="https://example.com/screenshot.jpg"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#c4ff0d] text-black rounded-xl hover:bg-[#d4ff3d] font-bold transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Complaint
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 bg-[#2a2a2a] text-gray-300 rounded-xl hover:bg-[#3a3a3a] font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Complaints;
