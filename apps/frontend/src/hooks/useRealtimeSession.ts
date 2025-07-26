import { useEffect, useState, useCallback } from 'react';
import { useWebSocket, SessionUpdate } from './useWebSocket';

export interface RealtimeSessionData {
  sessionId: string;
  participantCount: number;
  isJoined: boolean;
  lastActivity: Date | null;
  recentUpdates: SessionUpdate[];
  status: 'loading' | 'connected' | 'disconnected' | 'error';
}

export const useRealtimeSession = (sessionId: string) => {
  const { 
    connected, 
    joinSession, 
    leaveSession, 
    getSessionInfo, 
    addEventListener,
    sessionUpdates,
    getLatestSessionUpdate 
  } = useWebSocket();

  const [sessionData, setSessionData] = useState<RealtimeSessionData>({
    sessionId,
    participantCount: 0,
    isJoined: false,
    lastActivity: null,
    recentUpdates: [],
    status: 'loading',
  });

  const [autoJoined, setAutoJoined] = useState(false);

  // Join session when component mounts and WebSocket is connected
  const handleJoinSession = useCallback(() => {
    if (connected && sessionId && !autoJoined) {
      const success = joinSession(sessionId);
      if (success) {
        setAutoJoined(true);
        setSessionData(prev => ({ ...prev, status: 'connected', isJoined: true }));
        
        // Request current session info
        setTimeout(() => {
          getSessionInfo(sessionId);
        }, 100);
      }
    }
  }, [connected, sessionId, joinSession, getSessionInfo, autoJoined]);

  // Leave session when component unmounts
  const handleLeaveSession = useCallback(() => {
    if (connected && sessionId && autoJoined) {
      leaveSession(sessionId);
      setAutoJoined(false);
      setSessionData(prev => ({ ...prev, isJoined: false }));
    }
  }, [connected, sessionId, leaveSession, autoJoined]);

  // Manually join session (for user-triggered actions)
  const manualJoinSession = useCallback(() => {
    if (connected && sessionId) {
      const success = joinSession(sessionId);
      if (success) {
        setSessionData(prev => ({ ...prev, isJoined: true }));
      }
      return success;
    }
    return false;
  }, [connected, sessionId, joinSession]);

  // Manually leave session
  const manualLeaveSession = useCallback(() => {
    if (connected && sessionId) {
      const success = leaveSession(sessionId);
      if (success) {
        setSessionData(prev => ({ ...prev, isJoined: false }));
      }
      return success;
    }
    return false;
  }, [connected, sessionId, leaveSession]);

  // Refresh session info
  const refreshSessionInfo = useCallback(() => {
    if (connected && sessionId) {
      getSessionInfo(sessionId);
    }
  }, [connected, sessionId, getSessionInfo]);

  // Handle session updates
  useEffect(() => {
    const cleanup = addEventListener('sessionUpdate', (update: SessionUpdate) => {
      if (update.sessionId === sessionId) {
        setSessionData(prev => ({
          ...prev,
          lastActivity: new Date(update.timestamp),
          recentUpdates: [update, ...prev.recentUpdates.slice(0, 9)], // Keep last 10 updates
        }));

        // Update participant count based on update type
        if (update.type === 'participant_joined') {
          setSessionData(prev => ({
            ...prev,
            participantCount: update.data.participantCount || prev.participantCount + 1,
          }));
        } else if (update.type === 'participant_left') {
          setSessionData(prev => ({
            ...prev,
            participantCount: Math.max(0, update.data.participantCount || prev.participantCount - 1),
          }));
        }
      }
    });

    return cleanup;
  }, [sessionId, addEventListener]);

  // Handle session info responses
  useEffect(() => {
    const cleanup = addEventListener('sessionInfo', (info: any) => {
      if (info.sessionId === sessionId) {
        setSessionData(prev => ({
          ...prev,
          participantCount: info.participantCount || 0,
          isJoined: info.isConnected || false,
          lastActivity: info.lastActivity ? new Date(info.lastActivity) : null,
        }));
      }
    });

    return cleanup;
  }, [sessionId, addEventListener]);

  // Handle session joined confirmation
  useEffect(() => {
    const cleanup = addEventListener('sessionJoined', (data: any) => {
      if (data.sessionId === sessionId) {
        setSessionData(prev => ({
          ...prev,
          participantCount: data.participantCount || prev.participantCount,
          isJoined: true,
          lastActivity: new Date(data.timestamp),
        }));
      }
    });

    return cleanup;
  }, [sessionId, addEventListener]);

  // Handle session left confirmation
  useEffect(() => {
    const cleanup = addEventListener('sessionLeft', (data: any) => {
      if (data.sessionId === sessionId) {
        setSessionData(prev => ({
          ...prev,
          isJoined: false,
          lastActivity: new Date(data.timestamp),
        }));
      }
    });

    return cleanup;
  }, [sessionId, addEventListener]);

  // Auto-join when WebSocket connects
  useEffect(() => {
    if (connected) {
      setSessionData(prev => ({ ...prev, status: 'connected' }));
      handleJoinSession();
    } else {
      setSessionData(prev => ({ 
        ...prev, 
        status: 'disconnected',
        isJoined: false 
      }));
      setAutoJoined(false);
    }
  }, [connected, handleJoinSession]);

  // Update recent updates from global session updates
  useEffect(() => {
    const relevantUpdates = sessionUpdates.filter(update => update.sessionId === sessionId);
    setSessionData(prev => ({
      ...prev,
      recentUpdates: relevantUpdates.slice(0, 10), // Keep last 10
    }));
  }, [sessionUpdates, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleLeaveSession();
    };
  }, [handleLeaveSession]);

  // Get typed recent updates
  const getParticipantUpdates = useCallback(() => {
    return sessionData.recentUpdates.filter(update => 
      update.type === 'participant_joined' || update.type === 'participant_left'
    );
  }, [sessionData.recentUpdates]);

  const getStatusUpdates = useCallback(() => {
    return sessionData.recentUpdates.filter(update => 
      update.type === 'session_updated' || update.type === 'session_completed'
    );
  }, [sessionData.recentUpdates]);

  const getRewardUpdates = useCallback(() => {
    return sessionData.recentUpdates.filter(update => 
      update.type === 'reward_distributed'
    );
  }, [sessionData.recentUpdates]);

  return {
    // Session data
    sessionData,
    participantCount: sessionData.participantCount,
    isJoined: sessionData.isJoined,
    lastActivity: sessionData.lastActivity,
    recentUpdates: sessionData.recentUpdates,
    status: sessionData.status,
    
    // Connection state
    isConnected: connected && sessionData.status === 'connected',
    isLoading: sessionData.status === 'loading',
    
    // Actions
    joinSession: manualJoinSession,
    leaveSession: manualLeaveSession,
    refreshSessionInfo,
    
    // Helpers
    getParticipantUpdates,
    getStatusUpdates,
    getRewardUpdates,
    getLatestUpdate: () => getLatestSessionUpdate(sessionId),
    
    // Statistics
    totalUpdates: sessionData.recentUpdates.length,
    hasRecentActivity: sessionData.lastActivity && 
      Date.now() - sessionData.lastActivity.getTime() < 60000, // Within last minute
  };
};

export default useRealtimeSession;