import { Crown } from 'lucide-react';

const RoleModal = ({ user, onConfirm, onCancel }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#c4ff0d]/20 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-[#c4ff0d]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Make Admin</h3>
            <p className="text-gray-400 text-sm">Promote user to administrator</p>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <p className="text-gray-300 text-sm mb-2">
            Are you sure you want to make <span className="text-[#c4ff0d] font-medium">"{user.userName}"</span> an administrator?
          </p>
          <p className="text-gray-500 text-xs">
            This will give them full access to the admin dashboard and all administrative functions.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[#2a2a2a] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#c4ff0d] text-black font-medium rounded-lg hover:bg-[#a8d60d] transition"
          >
            Make Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
