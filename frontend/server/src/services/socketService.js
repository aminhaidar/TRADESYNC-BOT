import { io } from 'socket.io-client';

// Log connection attempts and debugging info
const debug = true;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.connectionStatusListeners = [];
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    
    if (debug) console.log('SocketService: Instance created');
  }

  connect(url = 'http://localhost:5001') {
    this.connectionAttempts++;
    
    if (debug) console.log(`SocketService: Connecting to ${url} (attempt ${this.connectionAttempts})`);
    
    if (this.socket) {
      if (debug) console.log('SocketService: Socket already exists, disconnecting first');
      this.disconnect();
    }
    
    try {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: this.maxConnectionAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true
      });
      
      if (debug) console.log('SocketService: Socket instance created');

      this.socket.on('connect', () => {
        if (debug) console.log('SocketService: Connected to WebSocket server');
        this.isConnected = true;
        this.connectionAttempts = 0;
        this._notifyConnectionStatusListeners('connected');
      });

      this.socket.on('disconnect', (reason) => {
        if (debug) console.log(`SocketService: Disconnected from WebSocket server: ${reason}`);
        this.isConnected = false;
        this._notifyConnectionStatusListeners('disconnected');
      });

      this.socket.on('connect_error', (error) => {
        if (debug) console.error(`SocketService: Connection error: ${error.message}`);
        this.isConnected = false;
        this._notifyConnectionStatusListeners('error');
        
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          if (debug) console.log('SocketService: Max connection attempts reached, will not retry');
          // In a real app, you might want to try reconnecting after a longer delay
        }
      });

      // Re-register all existing listeners
      Object.keys(this.listeners).forEach(event => {
        const callbacks = this.listeners[event];
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
      
      return this.socket;
    } catch (error) {
      if (debug) console.error(`SocketService: Error creating socket: ${error.message}`);
      this._notifyConnectionStatusListeners('error');
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      if (debug) console.log('SocketService: Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (debug) console.log(`SocketService: Registering listener for event '${event}'`);
    
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
    if (debug) console.log(`SocketService: Removing listener for event '${event}'`);
    
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (debug) console.log(`SocketService: Emitting event '${event}'`, data);
    
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      if (debug) console.warn(`SocketService: Cannot emit '${event}': socket is not connected`);
      // Queue event to be sent when connected
      setTimeout(() => {
        if (this.isConnected) {
          if (debug) console.log(`SocketService: Sending delayed event '${event}'`);
          this.socket.emit(event, data);
        }
      }, 1000);
    }
  }

  onConnectionStatus(callback) {
    if (debug) console.log('SocketService: Adding connection status listener');
    this.connectionStatusListeners.push(callback);
    
    // Immediately call with current status
    callback(this.getConnectionStatus());
    
    return () => {
      if (debug) console.log('SocketService: Removing connection status listener');
      this.connectionStatusListeners = this.connectionStatusListeners.filter(cb => cb !== callback);
    };
  }

  _notifyConnectionStatusListeners(status) {
    if (debug) console.log(`SocketService: Notifying listeners of status: ${status}`);
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
