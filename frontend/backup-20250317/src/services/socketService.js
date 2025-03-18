import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.connectionStatusListeners = [];
  }

  connect(url = 'http://localhost:5001') {
    if (this.socket) {
      console.log('Socket already exists, disconnecting first');
      this.disconnect();
    }

    console.log(`Connecting to socket server at ${url}`);
    
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this._notifyConnectionStatusListeners('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
      this._notifyConnectionStatusListeners('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      this._notifyConnectionStatusListeners('error');
    });

    // Re-register all existing listeners
    Object.keys(this.listeners).forEach(event => {
      const callbacks = this.listeners[event];
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: socket is not connected`);
    }
  }

  onConnectionStatus(callback) {
    this.connectionStatusListeners.push(callback);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(cb => cb !== callback);
    };
  }

  _notifyConnectionStatusListeners(status) {
    this.connectionStatusListeners.forEach(callback => {
      callback(status);
    });
  }

  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    return this.isConnected ? 'connected' : 'connecting';
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
