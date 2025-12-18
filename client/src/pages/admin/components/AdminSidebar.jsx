import { ChevronRight, Menu } from 'lucide-react';

const AdminSidebar = ({ 
  sidebarItems, 
  activeTab, 
  setActiveTab, 
  setSelectedUser,
  sidebarCollapsed, 
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen 
}) => {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSelectedUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <>
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
                <button 
                  key={item.id} 
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition relative ${
                    activeTab === item.id ? 'bg-[#c4ff0d] text-black' : 'text-gray-400 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#0f0f0f] border-r border-[#1a1a1a] flex-col transition-all duration-300 ease-in-out fixed left-0 h-[calc(95vh-4rem)] z-40`}>
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
            <button 
              key={item.id} 
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition relative ${
                activeTab === item.id ? 'bg-[#c4ff0d] text-black' : 'text-gray-400 hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.badge && sidebarCollapsed && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1a1a1a]">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="w-full flex items-center justify-center text-gray-400 hover:text-white"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
