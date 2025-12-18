import { useState, useEffect } from 'react';
import socketService from '../../../services/socketService';
import toast from 'react-hot-toast';

export const useAdminWebSocket = (setComplaints, setNewComplaintsCount) => {
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    console.log('Setting up admin WebSocket...');
    const socket = socketService.connect();
    
    const handleNewComplaint = (newComplaint) => {
      console.log('New complaint received via WebSocket:', newComplaint);
      setComplaints(prev => {
        const exists = prev.some(c => c._id === newComplaint._id);
        if (exists) return prev;
        return [newComplaint, ...prev];
      });
      setNewComplaintsCount(prev => prev + 1);
      toast.success(`New complaint: "${newComplaint.subject}"`, {
        icon: '📩',
        duration: 5000
      });
    };

    const handleComplaintStatusChanged = (data) => {
      console.log('Complaint status changed:', data);
      setComplaints(prev => 
        prev.map(c => c._id === data.complaintId ? data.complaint : c)
      );
    };

    const handleConnect = () => {
      console.log('Admin socket connected, joining admin_complaints room');
      setSocketConnected(true);
      socketService.joinAdminComplaints();
    };

    const handleDisconnect = () => {
      console.log('Admin socket disconnected');
      setSocketConnected(false);
    };
    
    if (socket) {
      if (socket.connected) {
        console.log('Socket already connected, joining admin_complaints room');
        setSocketConnected(true);
        socketService.joinAdminComplaints();
      }
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('new_complaint', handleNewComplaint);
      socket.on('complaint_status_changed', handleComplaintStatusChanged);
    }

    return () => {
      console.log('Cleaning up admin WebSocket...');
      socketService.leaveAdminComplaints();
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('new_complaint', handleNewComplaint);
        socket.off('complaint_status_changed', handleComplaintStatusChanged);
      }
    };
  }, [setComplaints, setNewComplaintsCount]);

  return { socketConnected };
};
