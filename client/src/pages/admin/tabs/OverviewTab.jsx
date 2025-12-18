import {
  Users, Smartphone, Gavel, TrendingUp, DollarSign, ShoppingBag, Receipt,
  UserCheck, Clock, Activity, BarChart3, PieChart as PieChartIcon, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import CustomTooltip from '../components/CustomTooltip';

const OverviewTab = ({ stats, users, phones, autoRefresh, setAutoRefresh, lastUpdated }) => {
  const safeStats = stats || {
    users: { total: 0, buyers: 0, admins: 0 },
    phones: { total: 0, live: 0, pending: 0 },
    auctions: { total: 0, active: 0, completed: 0, cancelled: 0 },
    bids: { total: 0, winning: 0 },
    revenue: { totalPlatformCommission: 0, totalSellerPayouts: 0, totalTransactionValue: 0 }
  };

  const generateActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    return days.map((day, index) => {
      const isToday = index === today;
      const baseUsers = Math.floor((users?.length || 0) / 7);
      const basePhones = Math.floor((phones?.length || 0) / 7);
      return {
        name: day,
        users: isToday ? (users?.length || 0) : Math.max(1, baseUsers + Math.floor(Math.random() * 3)),
        phones: isToday ? (phones?.length || 0) : Math.max(0, basePhones + Math.floor(Math.random() * 2)),
      };
    });
  };

  const phoneStatusData = [
    { name: 'Approved', value: safeStats.phones?.live || 0, color: '#10b981' },
    { name: 'Pending', value: safeStats.phones?.pending || 0, color: '#f59e0b' },
    { name: 'Rejected', value: Math.max(0, (safeStats.phones?.total || 0) - (safeStats.phones?.live || 0) - (safeStats.phones?.pending || 0)), color: '#ef4444' },
  ].filter(item => item.value > 0);

  const auctionMetrics = [
    { name: 'Active', value: safeStats.auctions?.active || 0, fill: '#c4ff0d' },
    { name: 'Completed', value: safeStats.auctions?.completed || 0, fill: '#10b981' },
    { name: 'Cancelled', value: safeStats.auctions?.cancelled || 0, fill: '#ef4444' },
  ];

  const revenueData = [
    { name: 'Commission', value: safeStats.revenue?.totalPlatformCommission || 0, fill: '#10b981' },
    { name: 'Payouts', value: safeStats.revenue?.totalSellerPayouts || 0, fill: '#3b82f6' },
    { name: 'Total Value', value: safeStats.revenue?.totalTransactionValue || 0, fill: '#8b5cf6' },
  ];

  const activityData = generateActivityData();

  const statCards = [
    { label: 'Total Users', value: safeStats.users?.total || 0, sub: `${safeStats.users?.buyers || 0} buyers, ${safeStats.users?.admins || 0} admins`, icon: Users, color: 'from-[#c4ff0d] to-[#a8d60d]' },
    { label: 'Total Phones', value: safeStats.phones?.total || 0, sub: `${safeStats.phones?.live || 0} live, ${safeStats.phones?.pending || 0} pending`, icon: Smartphone, color: 'from-[#c4ff0d] to-[#a8d60d]' },
    { label: 'Active Auctions', value: safeStats.auctions?.active || 0, sub: `${safeStats.auctions?.total || 0} total auctions`, icon: Gavel, color: 'from-[#c4ff0d] to-[#a8d60d]' },
    { label: 'Total Bids', value: safeStats.bids?.total || 0, sub: `${safeStats.bids?.winning || 0} winning bids`, icon: TrendingUp, color: 'from-[#c4ff0d] to-[#a8d60d]' },
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
                <card.icon className="w-4 h-4 lg:w-6 lg:h-6 text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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

        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-[#c4ff0d]" />
            <h3 className="text-base lg:text-lg font-semibold text-white">Phone Status</h3>
          </div>
          <div className="h-48 lg:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={phoneStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4 lg:mb-6">Revenue Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
            <div className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" /><span className="text-gray-400 text-xs lg:text-sm">Commission</span></div>
              <p className="text-lg lg:text-2xl font-bold text-green-500">₹{(stats?.revenue?.totalPlatformCommission || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2"><ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" /><span className="text-gray-400 text-xs lg:text-sm">Payouts</span></div>
              <p className="text-lg lg:text-2xl font-bold text-blue-500">₹{(stats?.revenue?.totalSellerPayouts || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2"><Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" /><span className="text-gray-400 text-xs lg:text-sm">Total</span></div>
              <p className="text-lg lg:text-2xl font-bold text-purple-500">₹{(stats?.revenue?.totalTransactionValue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4"><UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" /><h3 className="text-sm lg:text-lg font-semibold text-white">KYC Pending</h3></div>
            <p className="text-2xl lg:text-4xl font-bold text-yellow-500">{stats?.users?.kycPending || 0}</p>
          </div>
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl lg:rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4"><Clock className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" /><h3 className="text-sm lg:text-lg font-semibold text-white">Pending Phones</h3></div>
            <p className="text-2xl lg:text-4xl font-bold text-orange-500">{stats?.phones?.pending || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
