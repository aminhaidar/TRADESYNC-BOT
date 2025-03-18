import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const { socket, connectionStatus, connectionError, reconnectAttempts } = useSocket();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show connection status whenever it changes
    if (connectionStatus !== 'connected') {
      setVisible(true);
      
      // Hide after 5 seconds if connected
      const timer = setTimeout(() => {
        if (connectionStatus === 'connected') {
          setVisible(false);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      // Show for a few seconds, then hide
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);
  
  const handleReconnect = () => {
    if (socket) {
      socket.connect();
    }
  };
  
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'reconnecting':
        return `Reconnecting (${reconnectAttempts})...`;
      case 'error':
        return 'Connection Error';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Unknown Status';
    }
  };
  
  return (
    <div className={`connection-status ${connectionStatus} ${!visible ? 'hidden' : ''}`}>
      <div className="connection-status-indicator"></div>
      <div className="connection-status-text">{getStatusText()}</div>
      {connectionError && (
        <div className="connection-status-subtext">{connectionError}</div>
      )}
      {(connectionStatus === 'disconnected' || connectionStatus === 'failed' || connectionStatus === 'error') && (
        <button className="reconnect-button" onClick={handleReconnect}>
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
