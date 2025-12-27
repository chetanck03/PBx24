import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LayoutDashboard, Users, Smartphone, MessageSquare, CheckCircle } from 'lucide-react';

// Hooks
import { useAdminDashboard, useAdminWebSocket } from './admin/hooks';

// Components
import { 
  StatusBadge, 
  RoleModal, 
  DeleteModal, 
  AdminSidebar, 
  AdminHeader 
} from './admin/components';

// Tabs
import { 
  OverviewTab, 
  UsersTab, 
  PhonesTab, 
  SoldPhonesTab, 
  ComplaintsTab, 
  UserDetailTab 
} from './admin/tabs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newComplaintsCount, setNewComplaintsCount] = useState(0);
  
  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  // Custom hooks for data management
  const {
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
    setComplaints,
    setUsers,
    setSelectedUser,
    setAutoRefresh,
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
  } = useAdminDashboard();

  // WebSocket for real-time updates
  const { socketConnected } = useAdminWebSocket(setComplaints, setNewComplaintsCount, setUsers);

  // Sidebar navigation items
  const sidebarItems = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'phones', label: 'Phones', icon: Smartphone },
    { id: 'sold-phones', label: 'Sold Phones', icon: CheckCircle },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare, badge: newComplaintsCount > 0 ? newComplaintsCount : null },
  ], [newComplaintsCount]);

  // Initial data load
  useEffect(() => {
    loadDashboardData();
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab-specific data loading
  useEffect(() => {
    if (activeTab === 'complaints') loadComplaints();
    if (activeTab === 'sold-phones' && soldPhones.length === 0) loadSoldPhones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Auto-refresh for overview tab
  useEffect(() => {
    if (autoRefresh && activeTab === 'overview') {
      refreshIntervalRef.current = setInterval(() => {
        loadDashboardData(true);
      }, 60000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [autoRefresh, activeTab, loadDashboardData, refreshIntervalRef]);

  // Clear complaints badge when viewing complaints tab
  useEffect(() => {
    if (activeTab === 'complaints') {
      setNewComplaintsCount(0);
    }
  }, [activeTab]);

  // Modal handlers
  const handleOpenRoleModal = useCallback((userId, newRole, userName) => {
    setRoleModalUser({ userId, newRole, userName });
    setShowRoleModal(true);
  }, []);

  const confirmRoleUpdate = useCallback(async () => {
    if (!roleModalUser) return;
    const success = await handleUpdateRole(roleModalUser.userId, roleModalUser.newRole);
    if (success) {
      setShowRoleModal(false);
      setRoleModalUser(null);
    }
  }, [roleModalUser, handleUpdateRole]);

  const handleOpenDeleteModal = useCallback((userId, userName) => {
    setDeleteModalUser({ userId, userName });
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!deleteModalUser) return;
    const success = await handleDeleteUser(deleteModalUser.userId);
    if (success) {
      if (selectedUser?._id === deleteModalUser.userId) {
        setSelectedUser(null);
        setActiveTab('users');
      }
      setShowDeleteModal(false);
      setDeleteModalUser(null);
    }
  }, [deleteModalUser, handleDeleteUser, selectedUser, setSelectedUser]);

  // View user handler with tab switch
  const onViewUser = useCallback(async (user) => {
    await handleViewUser(user);
    setActiveTab('user-detail');
    setMobileMenuOpen(false);
  }, [handleViewUser]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <RefreshCw className="w-12 h-12 text-[#c4ff0d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row relative">
      {/* Sidebar */}
      <AdminSidebar
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedUser={setSelectedUser}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <AdminHeader
          activeTab={activeTab}
          sidebarItems={sidebarItems}
          socketConnected={socketConnected}
          onRefresh={loadDashboardData}
        />

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              users={users} 
              phones={phones} 
              autoRefresh={autoRefresh} 
              setAutoRefresh={setAutoRefresh} 
              lastUpdated={lastUpdated} 
            />
          )}
          
          {activeTab === 'users' && (
            <UsersTab 
              users={users} 
              onView={onViewUser} 
              onKYC={handleReviewKYC} 
              onDelete={handleOpenDeleteModal} 
              onUpdateRole={handleOpenRoleModal} 
              StatusBadge={StatusBadge} 
            />
          )}
          
          {activeTab === 'phones' && (
            <PhonesTab 
              phones={phones} 
              onVerify={handleVerifyPhone} 
              onDelete={handleDeletePhone} 
              onRefresh={loadDashboardData} 
              StatusBadge={StatusBadge} 
            />
          )}
          
          {activeTab === 'sold-phones' && (
            <SoldPhonesTab 
              soldPhones={soldPhones} 
              onViewUser={onViewUser} 
              StatusBadge={StatusBadge} 
            />
          )}
          
          {activeTab === 'complaints' && (
            <ComplaintsTab 
              complaints={complaints} 
              onUpdate={handleUpdateComplaint} 
              StatusBadge={StatusBadge} 
            />
          )}
          
          {activeTab === 'user-detail' && (
            <UserDetailTab 
              user={selectedUser} 
              phones={userPhones} 
              bids={userBids} 
              reels={userReels} 
              onBack={() => setActiveTab('users')} 
              onDeleteReel={handleDeleteReel} 
              onDeleteUser={handleOpenDeleteModal} 
            />
          )}
        </div>
      </main>

      {/* Role Update Modal */}
      {showRoleModal && (
        <RoleModal
          user={roleModalUser}
          onConfirm={confirmRoleUpdate}
          onCancel={() => {
            setShowRoleModal(false);
            setRoleModalUser(null);
          }}
        />
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <DeleteModal
          user={deleteModalUser}
          onConfirm={confirmDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteModalUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
