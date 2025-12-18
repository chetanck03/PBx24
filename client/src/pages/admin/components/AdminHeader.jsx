import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

const AdminHeader = ({ 
  activeTab, 
  sidebarItems, 
  socketConnected, 
  onRefresh 
}) => {
  const getTitle = () => {
    if (activeTab === 'user-detail') return 'User Details';
    return sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard';
  };

  return (
    <header className="bg-[#0f0f0f] border-b border-[#1a1a1a] p-4 lg:p-6 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">{getTitle()}</h1>
          <p className="text-gray-500 text-sm mt-1 hidden sm:block">Manage your platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
            socketConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {socketConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {socketConnected ? 'Live' : 'Offline'}
          </div>
          <button 
            onClick={onRefresh} 
            className="p-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl transition flex-shrink-0"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
