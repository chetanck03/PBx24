import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { adminAPI, reelAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, Smartphone, Receipt, MessageSquare, Search,
  TrendingUp, DollarSign, ShoppingBag, Gavel, UserCheck, Clock,
  ChevronRight, Eye, Check, X, Trash2, RefreshCw, Video, Play, Menu,
  Activity, BarChart3, PieChart as PieChartIcon, Zap, CheckCircle, ExternalLink
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [phones, setPhones] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPhones, setUserPhones] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [userReels, setUserReels] = useState([]);
  const [soldPhones, setSoldPhones] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const refreshIntervalRef = useRef(null);

  const loadDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        adminAPI.getPlatformStatistics(),
        adminAPI.getAllUsers({ limit: 100 }),
        adminAPI.getAllPhones({ limit: 100 }),
        adminAPI.getAllTransactions({ limit: 100 })
      ]);

      // Extract data from successful requests, use fallback for failed ones
      const [statsResult, usersResult, phonesResult, transactionsResult] = results;

      // Default stats structure for fallback
      const defaultStats = {
        users: { total: 0, buyers: 0, admins: 0 },
        phones: { total: 0, live: 0, pending: 0 },
        auctions: { total: 0, active: 0, completed: 0, cancelled: 0 },
        bids: { total: 0, winning: 0 },
        revenue: { totalPlatformCommission: 0, totalSellerPayouts: 0, totalTransactionValue: 0 }
      };

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data.data || defaultStats);
      } else {
        console.error('Stats fetch failed:', statsResult.reason);
        // Set default stats so UI can render
        setStats(prev => prev || defaultStats);
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value.data.data || []);
      } else {
        console.error('Users fetch failed:', usersResult.reason);
      }

      if (phonesResult.status === 'fulfilled') {
        setPhones(phonesResult.value.data.data || []);
      } else {
        console.error('Phones fetch failed:', phonesResult.reason);
      }

      if (transactionsResult.status === 'fulfilled') {
        setTransactions(transactionsResult.value.data.data || []);
      } else {
        console.error('Transactions fetch failed:', transactionsResult.reason);
      }

      setLastUpdated(new Date());

      // Show error only if all requests failed
      const allFailed = results.every(r => r.status === 'rejected');
      if (allFailed && !silent) {
        toast.error('Unable to connect to server. Please check if the backend is running.');
      } else if (results.some(r => r.status === 'rejected') && !silent) {
        toast.error('Some data failed to load. Showing available data.');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (!silent) {
        toast.error('Failed to load dashboard data');
      }
      // Set default stats so UI doesn't get stuck
      setStats(prev => prev || {
        users: { total: 0, buyers: 0, admins: 0 },
        phones: { total: 0, live: 0, pending: 0 },
        auctions: { total: 0, active: 0, completed: 0, cancelled: 0 },
        bids: { total: 0, winning: 0 },
        revenue: { totalPlatformCommission: 0, totalSellerPayouts: 0, totalTransactionValue: 0 }
      });
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

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (activeTab === 'complaints' && complaints.length === 0) loadComplaints();
    if (activeTab === 'sold-phones' && soldPhones.length === 0) loadSoldPhones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Real-time auto-refresh every 60 seconds
  useEffect(() => {
    if (autoRefresh && activeTab === 'overview') {
      refreshIntervalRef.current = setInterval(() => {
        loadDashboardData(true);
      }, 60000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [autoRefresh, activeTab, loadDashboardData]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await adminAPI.searchByIds(searchQuery);
      setSearchResults(res.data.data);
      setActiveTab('search');
    } catch (error) { console.error('Search error:', error); }
  }, [searchQuery]);

  const handleVerifyPhone = useCallback(async (phoneId, status) => {
    try {
      await adminAPI.verifyPhone(phoneId, { verificationStatus: status });
      setPhones(prev => prev.map(p => p._id === phoneId ? { ...p, verificationStatus: status } : p));
      toast.success(`Phone ${status} successfully!`);
    } catch (error) { toast.error('Failed to verify phone'); }
  }, []);

  const handleReviewKYC = useCallback(async (userId, status) => {
    try {
      await adminAPI.reviewKYC(userId, status);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, kycStatus: status } : u));
    } catch (error) { console.error('Error reviewing KYC:', error); }
  }, []);

  const handleDeleteUser = useCallback(async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      if (selectedUser?._id === userId) { setSelectedUser(null); setActiveTab('users'); }
      toast.success('User deleted!');
    } catch (error) { toast.error('Failed to delete user'); }
  }, [selectedUser]);

  const handleDeletePhone = useCallback(async (phoneId, phoneModel) => {
    if (!window.confirm(`Delete "${phoneModel}"?`)) return;
    try {
      await adminAPI.deletePhone(phoneId);
      setPhones(prev => prev.filter(p => p._id !== phoneId));
      setUserPhones(prev => prev.filter(p => p._id !== phoneId));
      toast.success('Phone deleted!');
    } catch (error) { toast.error('Failed to delete phone'); }
  }, []);

  const handleUpdateComplaint = useCallback(async (complaintId, status, response) => {
    try {
      await adminAPI.updateComplaint(complaintId, { status, adminResponse: response });
      setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, status } : c));
      toast.success('Complaint updated!');
    } catch (error) { toast.error('Failed to update complaint'); }
  }, []);

  const handleViewUser = useCallback(async (user) => {
    setSelectedUser(user);
    setActiveTab('user-detail');
    setMobileMenuOpen(false);
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
      // Store total views in selectedUser for display
      setSelectedUser(prev => ({ ...prev, totalReelViews: reelStats.totalViews || 0 }));
    } catch (error) { console.error('Error loading user details:', error); }
  }, []);

  const handleDeleteReel = useCallback(async (reelId) => {
    if (!window.confirm('Delete this reel?')) return;
    try {
      await reelAPI.deleteReel(reelId);
      setUserReels(prev => prev.filter(r => r._id !== reelId));
      toast.success('Reel deleted!');
    } catch (error) { toast.error('Failed to delete reel'); }
  }, []);

  const sidebarItems = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'phones', label: 'Phones', icon: Smartphone },
    { id: 'sold-phones', label: 'Sold Phones', icon: CheckCircle },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  ], []);

  const StatusBadge = ({ status }) => {
    const colors = {
      verified: 'bg-green-500/20 text-green-400', approved: 'bg-green-500/20 text-green-400',
      released: 'bg-green-500/20 text-green-400', completed: 'bg-green-500/20 text-green-400',
      resolved: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400',
      refunded: 'bg-red-500/20 text-red-400', pending: 'bg-yellow-500/20 text-yellow-400',
      'in-progress': 'bg-blue-500/20 text-blue-400', admin: 'bg-purple-500/20 text-purple-400',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors[status] || colors.pending}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <RefreshCw className="w-12 h-12 text-[#c4ff0d] animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#0f0f0f] border-b border-[#1a1a1a] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c4ff0d] rounded-xl flex items-center justify-center">
            <span className="text-black font-bold">A</span>
          </div>
          <span className="text-white font-semibold">Admin</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-[#0f0f0f] p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1a1a1a]">
              <div className="w-10 h-10 bg-[#c4ff0d] rounded-xl flex items-center justify-center">
                <span className="text-black font-bold">A</span>
              </div>
              <span className="text-white font-semibold">Admin Panel</span>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedUser(null); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === item.id ? 'bg-[#c4ff0d] text-black' : 'text-gray-400 hover:bg-[#1a1a1a]'}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#0f0f0f] border-r border-[#1a1a1a] flex-col transition-all`}>
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c4ff0d] rounded-xl flex items-center justify-center">
              <span className="text-black font-bold">A</span>
            </div>
            {!sidebarCollapsed && <span className="text-white font-semibold">Admin Panel</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedUser(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === item.id ? 'bg-[#c4ff0d] text-black' : 'text-gray-400 hover:bg-[#1a1a1a]'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1a1a1a]">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center text-gray-400 hover:text-white">
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-[#0f0f0f] border-b border-[#1a1a1a] p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                {activeTab === 'user-detail' ? 'User Details' : sidebarItems.find(i => i.id === activeTab)?.label || 'Search'}
              </h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">Manage your platform</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input type="text" placeholder="Search by ID, name, email..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full sm:w-48 lg:w-72 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <button onClick={loadDashboardData} className="p-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl transition flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} users={users} phones={phones} transactions={transactions} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} lastUpdated={lastUpdated} />}
          {activeTab === 'users' && <UsersTab users={users} onView={handleViewUser} onKYC={handleReviewKYC} onDelete={handleDeleteUser} StatusBadge={StatusBadge} />}
          {activeTab === 'phones' && <PhonesTab phones={phones} onVerify={handleVerifyPhone} onDelete={handleDeletePhone} onRefresh={loadDashboardData} StatusBadge={StatusBadge} />}
          {activeTab === 'sold-phones' && <SoldPhonesTab soldPhones={soldPhones} onViewUser={handleViewUser} StatusBadge={StatusBadge} />}
          {activeTab === 'transactions' && <TransactionsTab transactions={transactions} StatusBadge={StatusBadge} />}
          {activeTab === 'complaints' && <ComplaintsTab complaints={complaints} onUpdate={handleUpdateComplaint} StatusBadge={StatusBadge} />}
          {activeTab === 'user-detail' && <UserDetailTab user={selectedUser} phones={userPhones} bids={userBids} reels={userReels} onBack={() => setActiveTab('users')} onDeleteReel={handleDeleteReel} onDeleteUser={handleDeleteUser} />}
          {activeTab === 'search' && <SearchResultsTab results={searchResults} onViewUser={handleViewUser} />}
        </div>
      </main>
    </div>
  );
};


// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Overview Tab - Enhanced with Visual Analytics
const OverviewTab = ({ stats, users, phones, transactions, autoRefresh, setAutoRefresh, lastUpdated }) => {
  const CHART_COLORS = ['#c4ff0d', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

  // Use safe defaults if stats is null/undefined
  const safeStats = stats || {
    users: { total: 0, buyers: 0, admins: 0 },
    phones: { total: 0, live: 0, pending: 0 },
    auctions: { total: 0, active: 0, completed: 0, cancelled: 0 },
    bids: { total: 0, winning: 0 },
    revenue: { totalPlatformCommission: 0, totalSellerPayouts: 0, totalTransactionValue: 0 }
  };

  // Generate activity data from users (last 7 days simulation based on actual data)
  const generateActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    return days.map((day, index) => {
      const isToday = index === today;
      const baseUsers = Math.floor((users?.length || 0) / 7);
      const basePhones = Math.floor((phones?.length || 0) / 7);
      const baseTx = Math.floor((transactions?.length || 0) / 7);
      return {
        name: day,
        users: isToday ? (users?.length || 0) : Math.max(1, baseUsers + Math.floor(Math.random() * 3)),
        phones: isToday ? (phones?.length || 0) : Math.max(0, basePhones + Math.floor(Math.random() * 2)),
        transactions: isToday ? (transactions?.length || 0) : Math.max(0, baseTx + Math.floor(Math.random() * 2)),
      };
    });
  };

  // Phone status distribution for pie chart
  const phoneStatusData = [
    { name: 'Approved', value: safeStats.phones?.live || 0, color: '#10b981' },
    { name: 'Pending', value: safeStats.phones?.pending || 0, color: '#f59e0b' },
    { name: 'Rejected', value: Math.max(0, (safeStats.phones?.total || 0) - (safeStats.phones?.live || 0) - (safeStats.phones?.pending || 0)), color: '#ef4444' },
  ].filter(item => item.value > 0);

  // User role distribution
  const userRoleData = [
    { name: 'Buyers', value: safeStats.users?.buyers || 0, color: '#3b82f6' },
    { name: 'Sellers', value: Math.max(0, (safeStats.users?.total || 0) - (safeStats.users?.buyers || 0) - (safeStats.users?.admins || 0)), color: '#8b5cf6' },
    { name: 'Admins', value: safeStats.users?.admins || 0, color: '#c4ff0d' },
  ].filter(item => item.value > 0);

  // Auction metrics for bar chart
  const auctionMetrics = [
    { name: 'Active', value: safeStats.auctions?.active || 0, fill: '#c4ff0d' },
    { name: 'Completed', value: safeStats.auctions?.completed || 0, fill: '#10b981' },
    { name: 'Cancelled', value: safeStats.auctions?.cancelled || 0, fill: '#ef4444' },
  ];

  // Revenue breakdown for bar chart
  const revenueData = [
    { name: 'Commission', value: safeStats.revenue?.totalPlatformCommission || 0, fill: '#10b981' },
    { name: 'Payouts', value: safeStats.revenue?.totalSellerPayouts || 0, fill: '#3b82f6' },
    { name: 'Total Value', value: safeStats.revenue?.totalTransactionValue || 0, fill: '#8b5cf6' },
  ];

  const activityData = generateActivityData();

  const statCards = [
    { label: 'Total Users', value: safeStats.users?.total || 0, sub: `${safeStats.users?.buyers || 0} buyers, ${safeStats.users?.admins || 0} admins`, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Phones', value: safeStats.phones?.total || 0, sub: `${safeStats.phones?.live || 0} live, ${safeStats.phones?.pending || 0} pending`, icon: Smartphone, color: 'from-green-500 to-green-600' },
    { label: 'Active Auctions', value: safeStats.auctions?.active || 0, sub: `${safeStats.auctions?.total || 0} total auctions`, icon: Gavel, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Bids', value: safeStats.bids?.total || 0, sub: `${safeStats.bids?.winning || 0} winning bids`, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Real-time Status Bar */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-3 lg:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-gray-400 text-sm">
            {autoRefresh ? 'Live updates enabled' : 'Live updates paused'}
          </span>
          <span className="text-gray-600 text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
            autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:border-[#2a2a2a] transition">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs lg:text-sm truncate">{card.label}</p>
                <p className="text-xl lg:text-3xl font-bold text-white mt-1 lg:mt-2">{card.value}</p>
                <p className="text-gray-500 text-xs mt-1 truncate">{card.sub}</p>
              </div>
              <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 ml-2`}>
                <card.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Activity Trend & Phone Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Activity Trend Chart */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#c4ff0d]" />
              <h3 className="text-base lg:text-lg font-semibold text-white">Weekly Activity</h3>
            </div>
          </div>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPhones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c4ff0d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c4ff0d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="users" name="Users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                <Area type="monotone" dataKey="phones" name="Phones" stroke="#c4ff0d" fillOpacity={1} fill="url(#colorPhones)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phone Status Pie Chart */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-[#c4ff0d]" />
            <h3 className="text-base lg:text-lg font-semibold text-white">Phone Status</h3>
          </div>
          <div className="h-48 lg:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={phoneStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {phoneStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {phoneStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Revenue & Auction Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Revenue Bar Chart */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="text-base lg:text-lg font-semibold text-white">Revenue Breakdown</h3>
          </div>
          <div className="h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} width={80} />
                <Tooltip content={<CustomTooltip />} formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Auction Metrics */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="text-base lg:text-lg font-semibold text-white">Auction Metrics</h3>
          </div>
          <div className="h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auctionMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {auctionMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Stats & User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Revenue Cards */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4 lg:mb-6">Revenue Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
            <div className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" /><span className="text-gray-400 text-xs lg:text-sm">Commission</span></div>
              <p className="text-lg lg:text-2xl font-bold text-green-500">₹{(stats.revenue?.totalPlatformCommission || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2"><ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" /><span className="text-gray-400 text-xs lg:text-sm">Payouts</span></div>
              <p className="text-lg lg:text-2xl font-bold text-blue-500">₹{(stats.revenue?.totalSellerPayouts || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2"><Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" /><span className="text-gray-400 text-xs lg:text-sm">Total</span></div>
              <p className="text-lg lg:text-2xl font-bold text-purple-500">₹{(stats.revenue?.totalTransactionValue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* User Distribution & Pending Items */}
        <div className="space-y-4 lg:space-y-6">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4"><UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" /><h3 className="text-sm lg:text-lg font-semibold text-white">KYC Pending</h3></div>
            <p className="text-2xl lg:text-4xl font-bold text-yellow-500">{stats.users?.kycPending || 0}</p>
          </div>
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4"><Clock className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" /><h3 className="text-sm lg:text-lg font-semibold text-white">Pending Phones</h3></div>
            <p className="text-2xl lg:text-4xl font-bold text-orange-500">{stats.phones?.pending || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// Users Tab - Responsive with cards on mobile
const UsersTab = ({ users, onView, onKYC, onDelete, StatusBadge }) => (
  <div className="space-y-4">
    {/* Mobile Cards */}
    <div className="lg:hidden space-y-3">
      {users.map((user) => (
        <div key={user._id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{user.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={user.role} />
            <StatusBadge status={user.kycStatus} />
            <span className="text-[#c4ff0d] text-xs font-medium">₹{user.walletBalance || 0}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onView(user)} className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">View</button>
            {user.kycStatus === 'pending' && (
              <>
                <button onClick={() => onKYC(user._id, 'verified')} className="p-2 bg-green-500/20 rounded-lg"><Check className="w-4 h-4 text-green-400" /></button>
                <button onClick={() => onKYC(user._id, 'rejected')} className="p-2 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
              </>
            )}
            <button onClick={() => onDelete(user._id, user.name)} className="p-2 bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Anonymous ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">KYC</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Wallet</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-[#1a1a1a]/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{user.name?.charAt(0)}</div>
                    <div><p className="text-white font-medium">{user.name}</p><p className="text-gray-500 text-sm">{user.email}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-gray-400 font-mono text-sm">{user.anonymousId}</span></td>
                <td className="px-6 py-4"><StatusBadge status={user.role} /></td>
                <td className="px-6 py-4"><StatusBadge status={user.kycStatus} /></td>
                <td className="px-6 py-4 text-white font-medium">₹{user.walletBalance || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => onView(user)} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg"><Eye className="w-4 h-4 text-blue-400" /></button>
                    {user.kycStatus === 'pending' && (
                      <>
                        <button onClick={() => onKYC(user._id, 'verified')} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"><Check className="w-4 h-4 text-green-400" /></button>
                        <button onClick={() => onKYC(user._id, 'rejected')} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                      </>
                    )}
                    <button onClick={() => onDelete(user._id, user.name)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
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


// Phones Tab - Responsive (excludes sold phones)
const PhonesTab = ({ phones, onVerify, onDelete, onRefresh, StatusBadge }) => {
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };
  
  // Filter out sold phones - they appear in the Sold Phones tab
  const activePhones = phones.filter(phone => phone.status !== 'sold');
  
  // Apply verification status filter
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
            {phone.images?.[0] ? <img src={phone.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" /> : <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"><Smartphone className="w-6 h-6 text-gray-500" /></div>}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{phone.brand} {phone.model}</p>
              <p className="text-gray-500 text-xs">{phone.storage} - {phone.condition}</p>
              <p className="text-[#c4ff0d] font-bold mt-1">₹{phone.minBidPrice?.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge status={phone.verificationStatus} />
            <div className="flex gap-2">
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
                    {phone.images?.[0] ? <img src={phone.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center"><Smartphone className="w-6 h-6 text-gray-500" /></div>}
                    <div><p className="text-white font-medium">{phone.brand} {phone.model}</p><p className="text-gray-500 text-sm">{phone.storage} - {phone.condition}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 font-mono text-sm">{phone.anonymousSellerId?.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-white font-medium">₹{phone.minBidPrice?.toLocaleString()}</td>
                <td className="px-6 py-4"><StatusBadge status={phone.verificationStatus} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
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

// Transactions Tab - Responsive
const TransactionsTab = ({ transactions, StatusBadge }) => (
  <div className="space-y-4">
    {/* Mobile Cards */}
    <div className="lg:hidden space-y-3">
      {transactions.map((tx) => (
        <div key={tx._id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-gray-400 text-xs font-mono">#{tx._id?.slice(-8)}</p>
              <p className="text-white font-bold text-lg">₹{tx.finalAmount?.toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <StatusBadge status={tx.escrowStatus} />
              <StatusBadge status={tx.meetingStatus} />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <p>Seller: {tx.sellerId?.slice(0, 12)}...</p>
            <p>Buyer: {tx.buyerId?.slice(0, 12)}...</p>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Seller</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Buyer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Escrow</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Meeting</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {transactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-[#1a1a1a]/50">
                <td className="px-6 py-4 text-gray-400 font-mono text-sm">{tx._id?.slice(-8)}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{tx.sellerId?.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{tx.buyerId?.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-white font-medium">₹{tx.finalAmount?.toLocaleString()}</td>
                <td className="px-6 py-4"><StatusBadge status={tx.escrowStatus} /></td>
                <td className="px-6 py-4"><StatusBadge status={tx.meetingStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);


// Complaints Tab - Responsive
const ComplaintsTab = ({ complaints, onUpdate, StatusBadge }) => (
  <div className="space-y-3 lg:space-y-4">
    {complaints.length === 0 ? (
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center">
        <MessageSquare className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No complaints found</p>
      </div>
    ) : complaints.map((complaint) => (
      <div key={complaint._id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 lg:mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold truncate">{complaint.subject}</h4>
            <p className="text-gray-500 text-xs lg:text-sm">From: {complaint.userId?.anonymousId || 'Unknown'}</p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
        <p className="text-gray-300 text-sm mb-3 lg:mb-4 line-clamp-3">{complaint.description}</p>
        {complaint.status !== 'resolved' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => onUpdate(complaint._id, 'in-progress', '')} className="flex-1 sm:flex-none px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm">In Progress</button>
            <button onClick={() => onUpdate(complaint._id, 'resolved', 'Issue resolved')} className="flex-1 sm:flex-none px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm">Resolved</button>
          </div>
        )}
      </div>
    ))}
  </div>
);

// User Detail Tab - Responsive
const UserDetailTab = ({ user, phones, bids, reels, onBack, onDeleteReel, onDeleteUser }) => {
  if (!user) return null;
  // Use totalReelViews from user object (fetched from stats API) or calculate from reels
  const totalViews = user.totalReelViews || reels.reduce((sum, reel) => sum + (reel.views || 0), 0);
  return (
    <div className="space-y-4 lg:space-y-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Users
      </button>
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-bold flex-shrink-0">{user.name?.charAt(0)}</div>
            <div className="min-w-0">
              <h2 className="text-lg lg:text-2xl font-bold text-white truncate">{user.name}</h2>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
              <p className="text-[#c4ff0d] text-xs lg:text-sm mt-1">ID: {user.anonymousId}</p>
              <p className="text-gray-500 text-xs mt-1">User ID: {user._id}</p>
            </div>
          </div>
          <button onClick={() => onDeleteUser(user._id, user.name)} className="w-full sm:w-auto px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm">Delete User</button>
        </div>
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
            <div className="bg-[#1a1a1a] rounded-xl p-2 inline-block">
              <img 
                src={user.governmentIdProof} 
                alt="Government ID" 
                className="max-w-full max-h-64 rounded-lg object-contain cursor-pointer hover:opacity-80 transition"
                onClick={() => window.open(user.governmentIdProof, '_blank')}
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">Click image to view full size</p>
          </div>
        )}
        {!user.governmentIdProof && (
          <div className="mt-4 bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm">No government ID document uploaded</p>
          </div>
        )}
      </div>
      {phones.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-white font-semibold mb-3 lg:mb-4">Phones ({phones.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {phones.map((phone) => (
              <div 
                key={phone._id} 
                className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4 flex gap-3 cursor-pointer hover:bg-[#252525] hover:border-[#c4ff0d] border border-transparent transition-all"
                onClick={() => window.open(`/phone/${phone._id}`, '_blank')}
              >
                {phone.images?.[0] && <img src={phone.images[0]} alt="" className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover flex-shrink-0" />}
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
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4"><Video className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" /><h3 className="text-white font-semibold">Reels ({reels.length})</h3></div>
        {reels.length === 0 ? (
          <div className="text-center py-6 lg:py-8"><Video className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">No reels</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {reels.map((reel) => (
              <div key={reel._id} className="relative group">
                <div className="aspect-[9/16] bg-[#1a1a1a] rounded-lg lg:rounded-xl overflow-hidden">
                  <img src={reel.thumbnailUrl} alt="Reel" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="p-2 lg:p-3 bg-white/20 rounded-full"><Play className="w-4 h-4 lg:w-6 lg:h-6 text-white" fill="white" /></a>
                  </div>
                </div>
                <div className="mt-1 lg:mt-2 flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{reel.views || 0} views</span>
                  <button onClick={() => onDeleteReel(reel._id)} className="p-1 bg-red-500/20 rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sold Phones Tab - Shows all sold phones with buyer/seller details
const SoldPhonesTab = ({ soldPhones, onViewUser, StatusBadge }) => (
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
              {/* Phone Info */}
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
                    onClick={() => window.open(`/phone/${phone._id}`, '_blank')}
                    className="text-white font-medium truncate hover:text-[#c4ff0d] flex items-center gap-1"
                  >
                    {phone.brand} {phone.model}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <p className="text-gray-500 text-xs">{phone.storage} - {phone.condition}</p>
                  <p className="text-[#c4ff0d] font-bold mt-1">₹{(phone.saleAmount || phone.finalBidAmount || phone.minBidPrice)?.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Seller & Buyer */}
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
              
              {/* Status */}
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
                            onClick={() => window.open(`/phone/${phone._id}`, '_blank')}
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

// Search Results Tab - Responsive
const SearchResultsTab = ({ results, onViewUser }) => {
  if (!results) return <p className="text-gray-400 text-center py-8">No search results</p>;
  return (
    <div className="space-y-4 lg:space-y-6">
      {results.users?.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-white font-semibold mb-3 lg:mb-4">Users Found</h3>
          <div className="space-y-2">
            {results.users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-gray-500 text-xs truncate">{user.anonymousId}</p>
                </div>
                <button onClick={() => onViewUser(user)} className="ml-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm flex-shrink-0">View</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {results.phones?.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-white font-semibold mb-3 lg:mb-4">Phones Found</h3>
          <div className="space-y-2">
            {results.phones.map((phone) => (
              <div key={phone._id} className="p-3 bg-[#1a1a1a] rounded-xl">
                <p className="text-white font-medium">{phone.brand} {phone.model}</p>
                <p className="text-gray-500 text-xs">{phone.anonymousSellerId}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
