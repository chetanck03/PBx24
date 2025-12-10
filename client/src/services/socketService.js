import { io } from 'socket.io-client';

// Get the base URL without /api
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  // Remove /api from the end to get the socket server URL
  return apiUrl.replace(/\/api$/, '');
};

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.pendingRooms = new Set(); // Track rooms to join when connected
  }

  connect() {
    // If already connected, return existing socket
    if (this.socket?.connected) {
      return this.socket;
    }

    // If socket exists but not connected, try to reconnect
    if (this.socket) {
      this.socket.connect();
      return this.socket;
    }

    const socketUrl = getSocketUrl();
    console.log('Connecting to socket server:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Rejoin any pending rooms
      this.pendingRooms.forEach(room => {
        if (room.startsWith('phone_')) {
          const phoneId = room.replace('phone_', '');
          this.socket.emit('join_phone', phoneId);
          console.log('Rejoined phone room:', phoneId);
        } else if (room === 'admin_complaints') {
          this.socket.emit('join_admin_complaints');
          console.log('Rejoined admin complaints room');
        } else if (room === 'marketplace') {
          this.socket.emit('join_marketplace');
          console.log('Rejoined marketplace room');
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join user's personal room for receiving updates
  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join_user_room', userId);
      console.log('Joined user room:', userId);
    }
  }

  // Leave user's personal room
  leaveUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('leave_user_room', userId);
    }
  }

  // Join admin complaints room
  joinAdminComplaints() {
    this.pendingRooms.add('admin_complaints');
    
    if (this.socket?.connected) {
      this.socket.emit('join_admin_complaints');
      console.log('Joined admin complaints room');
    } else {
      console.log('Socket not connected, will join admin complaints room when connected');
      this.connect();
    }
  }

  // Leave admin complaints room
  leaveAdminComplaints() {
    this.pendingRooms.delete('admin_complaints');
    
    if (this.socket?.connected) {
      this.socket.emit('leave_admin_complaints');
      console.log('Left admin complaints room');
    }
  }

  // Listen for new complaints (admin)
  onNewComplaint(callback) {
    if (this.socket) {
      this.socket.on('new_complaint', callback);
    }
  }

  // Listen for complaint updates (user)
  onComplaintUpdated(callback) {
    if (this.socket) {
      this.socket.on('complaint_updated', callback);
    }
  }

  // Listen for complaint status changes (admin)
  onComplaintStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('complaint_status_changed', callback);
    }
  }

  // Join phone room for real-time bid updates
  joinPhoneRoom(phoneId) {
    if (!phoneId) return;
    
    const roomName = `phone_${phoneId}`;
    this.pendingRooms.add(roomName);
    
    if (this.socket?.connected) {
      this.socket.emit('join_phone', phoneId);
      console.log('Joined phone room:', phoneId);
    } else {
      console.log('Socket not connected, will join phone room when connected:', phoneId);
      // Ensure socket is connecting
      this.connect();
    }
  }

  // Leave phone room
  leavePhoneRoom(phoneId) {
    if (!phoneId) return;
    
    const roomName = `phone_${phoneId}`;
    this.pendingRooms.delete(roomName);
    
    if (this.socket?.connected) {
      this.socket.emit('leave_phone', phoneId);
      console.log('Left phone room:', phoneId);
    }
  }

  // Listen for new bids
  onNewBid(callback) {
    if (this.socket) {
      this.socket.on('new_bid', callback);
    }
  }

  // Join marketplace room for real-time new listings
  joinMarketplace() {
    this.pendingRooms.add('marketplace');
    
    if (this.socket?.connected) {
      this.socket.emit('join_marketplace');
      console.log('Joined marketplace room');
    } else {
      this.connect();
    }
  }

  // Leave marketplace room
  leaveMarketplace() {
    this.pendingRooms.delete('marketplace');
    
    if (this.socket?.connected) {
      this.socket.emit('leave_marketplace');
    }
  }

  // Listen for new listings
  onNewListing(callback) {
    if (this.socket) {
      this.socket.on('new_listing', callback);
    }
  }

  // Remove specific listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isSocketConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
