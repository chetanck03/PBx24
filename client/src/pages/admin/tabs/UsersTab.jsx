import { Eye, Check, X, Trash2, Crown } from 'lucide-react';

const UsersTab = ({ users, onView, onKYC, onDelete, onUpdateRole, StatusBadge }) => (
  <div className="space-y-4">
    {/* Mobile Cards */}
    <div className="lg:hidden space-y-3">
      {users.map((user) => (
        <div key={user._id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c4ff0d] to-[#a8d60d] rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
              {user.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={user.role} />
            <StatusBadge status={user.kycStatus} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => onView(user)} className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">View</button>
            {user.kycStatus === 'pending' && (
              <>
                <button onClick={() => onKYC(user._id, 'verified')} className="p-2 bg-green-500/20 rounded-lg"><Check className="w-4 h-4 text-green-400" /></button>
                <button onClick={() => onKYC(user._id, 'rejected')} className="p-2 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
              </>
            )}
            {user.role !== 'admin' && (
              <button onClick={() => onUpdateRole(user._id, 'admin', user.name)} className="p-2 bg-[#c4ff0d]/20 rounded-lg" title="Make Admin"><Crown className="w-4 h-4 text-[#c4ff0d]" /></button>
            )}
            {user.role !== 'admin' && (
              <button onClick={() => onDelete(user._id, user.name)} className="p-2 bg-red-500/20 rounded-lg" title="Delete User"><Trash2 className="w-4 h-4 text-red-400" /></button>
            )}
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-[#1a1a1a]/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#c4ff0d] to-[#a8d60d] rounded-full flex items-center justify-center text-black font-bold">{user.name?.charAt(0)}</div>
                    <div><p className="text-white font-medium">{user.name}</p><p className="text-gray-500 text-sm">{user.email}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-gray-400 font-mono text-sm">{user.anonymousId}</span></td>
                <td className="px-6 py-4"><StatusBadge status={user.role} /></td>
                <td className="px-6 py-4"><StatusBadge status={user.kycStatus} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => onView(user)} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg" title="View User"><Eye className="w-4 h-4 text-blue-400" /></button>
                    {user.kycStatus === 'pending' && (
                      <>
                        <button onClick={() => onKYC(user._id, 'verified')} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg" title="Verify KYC"><Check className="w-4 h-4 text-green-400" /></button>
                        <button onClick={() => onKYC(user._id, 'rejected')} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Reject KYC"><X className="w-4 h-4 text-red-400" /></button>
                      </>
                    )}
                    {user.role !== 'admin' && (
                      <button onClick={() => onUpdateRole(user._id, 'admin', user.name)} className="p-2 bg-[#c4ff0d]/20 hover:bg-[#c4ff0d]/30 rounded-lg" title="Make Admin"><Crown className="w-4 h-4 text-[#c4ff0d]" /></button>
                    )}
                    {user.role !== 'admin' && (
                      <button onClick={() => onDelete(user._id, user.name)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Delete User"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    )}
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

export default UsersTab;
