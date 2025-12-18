import { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI, reelAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [phones, setPhones] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [soldPhones, setSoldPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPhones, setUserPhones] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [userReels, setUserReels] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const refreshIntervalRef = useRef(null);

  const defaultStats = {
    users: { total: 0, buyers: 0, admins: 0 },
    phones: { total: 0, live: 0, pending: 0 },
    auctions: { total: 0, active: 0, completed: 0, cancelled: 0 },
    bids: { total: 0, winning: 0 },
    revenue: { totalPlatformCommission: 0, totalSellerPayouts: 0, totalTransactionValue: 0 }
  };

  const loadDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Use Promise.allSettled for parallel loading with graceful error handling
      const results = await Promise.allSettled([
        adminAPI.getPlatformStatistics(),
        adminAPI.getAllUsers({ limit: 100 }),
        adminAPI.getAllPhones({ limit: 100 })
      ]);

      const [statsResult, usersResult, phonesResult] = results;

      // Update state in batch for better performance
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data.data || defaultStats);
      } else {
        setStats(prev => prev || defaultStats);
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value.data.data || []);
      }

      if (phonesResult.status === 'fulfilled') {
        setPhones(phonesResult.value.data.data || []);
      }

      setLastUpdated(new Date());

      // Only show error toast if all requests failed
      const allFailed = results.every(r => r.status === 'rejected');
      if (allFailed && !silent) {
        toast.error('Unable to connect to server');
      }
    } catch (error) {
      if (!silent) toast.error('Failed to load dashboard data');
      setStats(prev => prev || defaultStats);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    try {
      const res = await adminAPI.getAllComplaints();
      setComplaints(res.data.data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  }, []);

  const loadSoldPhones = useCallback(async () => {
    try {
      const res = await adminAPI.getSoldPhones();
      setSoldPhones(res.data.data || []);
    } catch (error) {
      console.error('Error loading sold phones:', error);
    }
  }, []);

  const handleVerifyPhone = useCallback(async (phoneId, status) => {
    try {
      await adminAPI.verifyPhone(phoneId, { verificationStatus: status });
      
      setPhones(prev => prev.map(p => p._id === phoneId ? { 
        ...p, 
        verificationStatus: status,
        status: status === 'approved' ? 'live' : 'rejected'
      } : p));
      
      toast.success(`Phone ${status} successfully!`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadDashboardData();
    } catch (error) { 
      console.error('Error verifying phone:', error);
      toast.error(`Failed to verify phone: ${error.response?.data?.error?.message || error.message}`); 
    }
  }, [loadDashboardData]);

  const handleReviewKYC = useCallback(async (userId, status) => {
    try {
      await adminAPI.reviewKYC(userId, status);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, kycStatus: status } : u));
    } catch (error) { 
      console.error('Error reviewing KYC:', error); 
    }
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      if (selectedUser?._id === userId) { 
        setSelectedUser(null); 
      }
      toast.success('User deleted!');
      return true;
    } catch (error) { 
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user'); 
      return false;
    }
  }, [selectedUser]);

  const handleUpdateRole = useCallback(async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}!`);
      return true;
    } catch (error) { 
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  }, []);

  const handleDeletePhone = useCallback(async (phoneId, phoneModel) => {
    if (!window.confirm(`Delete "${phoneModel}"?`)) return;
    try {
      await adminAPI.deletePhone(phoneId);
      setPhones(prev => prev.filter(p => p._id !== phoneId));
      setUserPhones(prev => prev.filter(p => p._id !== phoneId));
      toast.success('Phone deleted!');
    } catch (error) { 
      toast.error('Failed to delete phone'); 
    }
  }, []);

  const handleUpdateComplaint = useCallback(async (complaintId, status, response) => {
    try {
      await adminAPI.updateComplaint(complaintId, { status, adminResponse: response });
      setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, status } : c));
      toast.success('Complaint updated!');
    } catch (error) { 
      toast.error('Failed to update complaint'); 
    }
  }, []);

  const handleViewUser = useCallback(async (user) => {
    setSelectedUser(user);
    try {
      const [phonesRes, bidsRes, reelStatsRes] = await Promise.all([
        adminAPI.getAllPhones({ sellerId: user._id }),
        adminAPI.getAllBids({ bidderId: user._id }),
        reelAPI.getUserReelStats(user._id).catch(() => ({ data: { data: { reels: [], totalViews: 0 } } }))
      ]);
      setUserPhones(phonesRes.data.data || []);
      setUserBids(bidsRes.data.data || []);
      const reelStats = reelStatsRes.data.data || { reels: [], totalViews: 0 };
      setUserReels(reelStats.reels || []);
      setSelectedUser(prev => ({ ...prev, totalReelViews: reelStats.totalViews || 0 }));
    } catch (error) { 
      console.error('Error loading user details:', error); 
    }
  }, []);

  const handleDeleteReel = useCallback(async (reelId) => {
    if (!window.confirm('Delete this reel?')) return;
    try {
      await reelAPI.deleteReel(reelId);
      setUserReels(prev => prev.filter(r => r._id !== reelId));
      toast.success('Reel deleted!');
    } catch (error) { 
      toast.error('Failed to delete reel'); 
    }
  }, []);

  return {
    // State
    stats,
    users,
    phones,
    complaints,
    soldPhones,
    loading,
    selectedUser,
    userPhones,
    userBids,
    userReels,
    autoRefresh,
    lastUpdated,
    refreshIntervalRef,
    // Setters
    setComplaints,
    setSelectedUser,
    setAutoRefresh,
    // Actions
    loadDashboardData,
    loadComplaints,
    loadSoldPhones,
    handleVerifyPhone,
    handleReviewKYC,
    handleDeleteUser,
    handleUpdateRole,
    handleDeletePhone,
    handleUpdateComplaint,
    handleViewUser,
    handleDeleteReel,
  };
};
