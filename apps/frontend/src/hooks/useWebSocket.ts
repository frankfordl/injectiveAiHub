import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from '@/components/WalletProvider';

export interface SessionUpdate {
  sessionId: string;
  type: 'participant_joined' | 'participant_left' | 'session_updated' | 'session_completed' | 'reward_distributed';
  data: any;
  timestamp: Date;
}

export interface Notification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export const useWebSocket = () => {
  const { account, isConnected: walletConnected } = useWallet();
  const socketRef = useRef<Socket | null>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sessionUpdates, setSessionUpdates] = useState<SessionUpdate[]>([]);
  
  // Event listeners storage
  const eventListeners = useRef<Map<string, Set<Function>>>(new Map());

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected || !walletConnected || !account) {
      return;
    }

    setConnectionStatus(prev => ({ ...prev, connecting: true, error: null }));

    try {
      socketRef.current = io(`${WS_URL}/sessions`, {
        query: {
          userId: account,
          walletAddress: account,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('WebSocket connected');
        setConnectionStatus({
          connected: true,
          connecting: false,
          error: null,
          lastConnected: new Date(),
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: `Disconnected: ${reason}`,
        }));
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: error.message,
        }));
      });

      // App-specific events
      socket.on('connected', (data) => {
        console.log('Successfully authenticated with WebSocket:', data);
      });

      socket.on('sessionUpdate', (update: SessionUpdate) => {
        console.log('Session update received:', update);
        setSessionUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
        
        // Trigger listeners for this event
        const listeners = eventListeners.current.get('sessionUpdate');
        if (listeners) {
          listeners.forEach(listener => listener(update));
        }
      });

      socket.on('notification', (notification: Notification) => {
        console.log('Notification received:', notification);
        setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20 notifications
        
        // Trigger listeners for this event
        const listeners = eventListeners.current.get('notification');
        if (listeners) {
          listeners.forEach(listener => listener(notification));
        }
      });

      socket.on('rewardUpdate', (data) => {
        console.log('Reward update received:', data);
        
        // Trigger listeners for this event
        const listeners = eventListeners.current.get('rewardUpdate');
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      });

      socket.on('transactionUpdate', (data) => {
        console.log('Transaction update received:', data);
        
        // Trigger listeners for this event
        const listeners = eventListeners.current.get('transactionUpdate');
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      });

      socket.on('sessionListUpdate', (data) => {
        console.log('Session list update received:', data);
        
        // Trigger listeners for this event
        const listeners = eventListeners.current.get('sessionListUpdate');
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      });

      socket.on('announcement', (data) => {
        console.log('Announcement received:', data);
        
        // Add as notification
        const announcement: Notification = {
          type: data.type || 'info',
          title: data.title,
          message: data.message,
          timestamp: new Date(data.timestamp),
        };
        setNotifications(prev => [announcement, ...prev.slice(0, 19)]);
        
        // Trigger listeners for this event
        const listeners = eventListeners.current.get('announcement');
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          error: error.message || 'Unknown error',
        }));
      });

    } catch (error: any) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus(prev => ({
        ...prev,
        connecting: false,
        error: error.message,
      }));
    }
  }, [account, walletConnected]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        connecting: false,
      }));
    }
  }, []);

  // Join a session room
  const joinSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinSession', { sessionId });
      return true;
    }
    return false;
  }, []);

  // Leave a session room
  const leaveSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveSession', { sessionId });
      return true;
    }
    return false;
  }, []);

  // Get session info
  const getSessionInfo = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('getSessionInfo', { sessionId });
      return true;
    }
    return false;
  }, []);

  // Add event listener
  const addEventListener = useCallback((event: string, listener: Function) => {
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set());
    }
    eventListeners.current.get(event)!.add(listener);

    // Return cleanup function
    return () => {
      const listeners = eventListeners.current.get(event);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          eventListeners.current.delete(event);
        }
      }
    };
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear session updates
  const clearSessionUpdates = useCallback(() => {
    setSessionUpdates([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Get latest update for a session
  const getLatestSessionUpdate = useCallback((sessionId: string) => {
    return sessionUpdates.find(update => update.sessionId === sessionId);
  }, [sessionUpdates]);

  // Auto-connect when wallet connects
  useEffect(() => {
    if (walletConnected && account && !socketRef.current?.connected) {
      connect();
    } else if (!walletConnected && socketRef.current?.connected) {
      disconnect();
    }
  }, [walletConnected, account, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    connectionStatus,
    connected: connectionStatus.connected,
    
    // Data
    notifications,
    sessionUpdates,
    unreadNotifications: notifications.filter(n => 
      Date.now() - new Date(n.timestamp).getTime() < 5000 // Unread for 5 seconds
    ).length,
    
    // Actions
    connect,
    disconnect,
    joinSession,
    leaveSession,
    getSessionInfo,
    
    // Event handling
    addEventListener,
    
    // Data management
    clearNotifications,
    clearSessionUpdates,
    removeNotification,
    getLatestSessionUpdate,
    
    // Utils
    isConnected: connectionStatus.connected,
    isConnecting: connectionStatus.connecting,
    hasError: !!connectionStatus.error,
    error: connectionStatus.error,
  };
};

export default useWebSocket;