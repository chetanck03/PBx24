const StatusBadge = ({ status }) => {
  const colors = {
    verified: 'bg-green-500/20 text-green-400',
    approved: 'bg-green-500/20 text-green-400',
    released: 'bg-green-500/20 text-green-400',
    completed: 'bg-green-500/20 text-green-400',
    resolved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    refunded: 'bg-red-500/20 text-red-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    'in-progress': 'bg-blue-500/20 text-blue-400',
    admin: 'bg-purple-500/20 text-purple-400',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
