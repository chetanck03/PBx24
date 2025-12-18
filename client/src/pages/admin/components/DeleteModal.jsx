import { Trash2 } from 'lucide-react';

const DeleteModal = ({ user, onConfirm, onCancel }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Delete User</h3>
            <p className="text-gray-400 text-sm">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <p className="text-gray-300 text-sm mb-2">
            Are you sure you want to delete <span className="text-red-400 font-medium">"{user.userName}"</span>?
          </p>
          <p className="text-gray-500 text-xs">
            This will permanently remove the user and all their data from the system.
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
            className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
