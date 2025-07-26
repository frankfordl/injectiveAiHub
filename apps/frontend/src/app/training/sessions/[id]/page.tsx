'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Progress, Avatar } from '@heroui/react';
import { useToast } from '@/components/cotrain/ui/use-toast';
import { useInjectiveContract } from '@/hooks/useInjectiveContract';
import { useInjectiveTransactionStatus } from '@/hooks/useInjectiveTransactionStatus';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  ArrowLeft,
  Users,
  Trophy,
  Clock,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Star,
  Activity,
  Share2,
  MoreHorizontal
} from 'lucide-react';

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  stakeAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  duration: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  creator: string;
  participants: ParticipantInfo[];
}

interface ParticipantInfo {
  address: string;
  score: number;
  joinedAt: Date;
  contribution?: string;
}

// Mock data for demonstration
const mockSessionData: SessionDetails = {
  id: '0x1234567890abcdef',
  name: 'Advanced NLP Model Training',
  description: 'Train a state-of-the-art natural language processing model with distributed computing. This session focuses on training a transformer-based model for multilingual text understanding and generation. Participants will contribute computational resources and receive rewards based on their contribution quality and duration.',
  rewardAmount: 50000000000, // 500 APT in octas
  maxParticipants: 20,
  currentParticipants: 15,
  duration: 7200,
  status: 'active',
  createdAt: new Date(Date.now() - 86400000),
  creator: '0xabcdef1234567890',
  participants: [
    {
      address: '0x1111111111111111',
      score: 95,
      joinedAt: new Date(Date.now() - 3600000),
      contribution: 'High-quality data preprocessing'
    },
    {
      address: '0x2222222222222222',
      score: 87,
      joinedAt: new Date(Date.now() - 7200000),
      contribution: 'Model optimization contributions'
    },
    {
      address: '0x3333333333333333',
      score: 92,
      joinedAt: new Date(Date.now() - 10800000),
      contribution: 'Validation data preparation'
    },
  ],
};

export default function SessionDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  // 更新：使用Injective hooks
  const { 
    registerForSession, 
    getSessionDetails, 
    connected, 
    account, 
    isLoading: contractLoading,
    completeSession
  } = useInjectiveContract();
  const { trackTransaction, pendingTransactions } = useInjectiveTransactionStatus();
  
  const sessionId = params.id as string;
  
  const { 
    sessionData: realtimeData, 
    isConnected: wsConnected, 
    participantCount: liveParticipantCount,
    recentUpdates,
    hasRecentActivity,
    getParticipantUpdates,
    refreshSessionInfo
  } = useRealtimeSession(sessionId);
  const { connected: wsEnabled, notifications } = useWebSocket();

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [userParticipation, setUserParticipation] = useState<ParticipantInfo | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  useEffect(() => {
    if (session && account) {
      const participation = session.participants.find(p => p.address === account.address.toString());
      setUserParticipation(participation || null);
    }
  }, [session, account]);

  const loadSessionData = async () => {
    setIsLoading(true);
    try {
      // 从数据库获取会话详情
      const response = await fetch(`/api/training-sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const sessionData = await response.json();
      
      if (sessionData.error) {
        throw new Error(sessionData.error);
      }

      // 生成随机参与者数据
      const mockParticipants: ParticipantInfo[] = [];
      const participantCount = Math.min(sessionData.currentParticipants || 0, sessionData.maxParticipants || 0);
      
      // 更丰富的贡献类型
      const contributionTypes = [
        'High-quality data preprocessing',
        'Model optimization contributions', 
        'Validation data preparation',
        'Training data augmentation',
        'Performance monitoring',
        'Hyperparameter tuning',
        'Data quality assurance',
        'Model architecture improvements',
        'Loss function optimization',
        'Distributed training coordination',
        'Gradient synchronization',
        'Memory optimization',
        'Computational efficiency improvements',
        'Model convergence analysis',
        'Cross-validation implementation'
      ];
      
      // 更真实的地址前缀
      const addressPrefixes = [
        '0xa1b2c3d4e5f6',
        '0xf1e2d3c4b5a6',
        '0x1a2b3c4d5e6f',
        '0x9f8e7d6c5b4a',
        '0x5a4b3c2d1e0f',
        '0xc1d2e3f4a5b6',
        '0x7f6e5d4c3b2a',
        '0x2b3c4d5e6f7a'
      ];
      
      for (let i = 0; i < participantCount; i++) {
        // 生成更真实的地址
        const prefix = addressPrefixes[Math.floor(Math.random() * addressPrefixes.length)];
        const suffix = Math.random().toString(16).substr(2, 8);
        
        // 生成权重分布的分数（更多高分参与者）
        let score;
        const rand = Math.random();
        if (rand < 0.3) {
          score = Math.floor(Math.random() * 10) + 90; // 30% 概率 90-100分
        } else if (rand < 0.6) {
          score = Math.floor(Math.random() * 15) + 80; // 30% 概率 80-95分
        } else {
          score = Math.floor(Math.random() * 20) + 70; // 40% 概率 70-90分
        }
        
        // 生成更真实的加入时间分布
        const maxDaysAgo = 30; // 最多30天前
        const daysAgo = Math.random() * maxDaysAgo;
        const joinedAt = new Date(Date.now() - daysAgo * 86400000);
        
        mockParticipants.push({
          address: `${prefix}${suffix}`,
          score: score,
          joinedAt: joinedAt,
          contribution: contributionTypes[Math.floor(Math.random() * contributionTypes.length)]
        });
      }
      
      // 按分数降序排序参与者
      mockParticipants.sort((a, b) => b.score - a.score);
      
      // 合并数据库数据和随机参与者数据
      const sessionWithParticipants: SessionDetails = {
        ...sessionData,
        createdAt: sessionData.createdAt,
        participants: mockParticipants
      };
      
      setSession(sessionWithParticipants);
      console.log('获取到的会话详情:', sessionWithParticipants);
    } catch (error: any) {
      console.error('获取会话详情失败:', error);
      toast({
        title: "Error",
        description: "Failed to load session details: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!connected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to join the session.",
        variant: "destructive",
      });
      return;
    }

    if (!session) return;

    if (session.currentParticipants >= session.maxParticipants) {
      toast({
        title: "Session Full",
        description: "This session has reached maximum participants.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const result = await registerForSession(sessionId);

      if (result.success && result.hash) {
        await trackTransaction(result.hash, 'join_session', 'Joining training session');
        
        toast({
          title: "Registration Initiated",
          description: "Your registration is being processed on the blockchain.",
        });

        // Refresh session data after a delay
        setTimeout(() => {
          loadSessionData();
        }, 3000);
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Failed to join session.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!connected || !account || !session) return;

    if (session.creator !== account.address.toString()) {
      toast({
        title: "Access Denied",
        description: "Only the session creator can complete the session.",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);
    try {
      const result = await completeSession(sessionId);

      if (result.success && result.hash) {
        await trackTransaction(result.hash, 'complete_session', 'Completing training session');
        
        toast({
          title: "Completion Initiated",
          description: "Session completion is being processed on the blockchain.",
        });

        setTimeout(() => {
          loadSessionData();
        }, 3000);
      } else {
        toast({
          title: "Completion Failed",
          description: result.message || "Failed to complete session.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip color="success" size="sm">Active</Chip>;
      case 'completed':
        return <Chip color="default" size="sm">Completed</Chip>;
      case 'pending':
        return <Chip variant="bordered" size="sm">Pending</Chip>;
      default:
        return <Chip variant="bordered" size="sm">{status}</Chip>;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatReward = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(numAmount || 0).toFixed(4)} INJ`;
  };

  // Use real-time participant count if available, fallback to session data
  const currentParticipants = liveParticipantCount > 0 ? liveParticipantCount : session?.currentParticipants || 0;
  const participationProgress = session ? (currentParticipants / session.maxParticipants) * 100 : 0;
  const isCreator = session && account && session.creator === account.address.toString();
  const isParticipant = !!userParticipation;
  const canJoin = session && session.status === 'active' && !isParticipant && session.currentParticipants < session.maxParticipants;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading session details...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-danger" />
          <span className="text-danger">Session not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="light" size="sm" onPress={() => router.back()} startContent={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
      </div>

      {/* Real-time Connection Status */}
      {wsEnabled && (
        <div className={`mb-6 p-4 rounded-lg border ${wsConnected ? 'border-success-200 bg-success-50' : 'border-warning-200 bg-warning-50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success-500' : 'bg-warning-500'} ${wsConnected ? 'animate-pulse' : ''}`} />
            <span className={wsConnected ? 'text-success-800' : 'text-warning-800'}>
              {wsConnected ? 'Live updates enabled' : 'Connecting to live updates...'}
              {hasRecentActivity && ' • Recent activity detected'}
            </span>
          </div>
        </div>
      )}

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-primary-200 bg-primary-50">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-primary-800">
              {pendingTransactions.length} transaction(s) pending...
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{session.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    {getStatusBadge(session.status)}
                    <div className="flex items-center gap-1 text-sm text-default-500">
                      <User className="h-4 w-4" />
                      Creator: {formatAddress(session.creator)}
                    </div>
                  </div>
                </div>
                <Button variant="bordered" size="sm" startContent={<Share2 className="h-4 w-4" />}>
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-default-500 leading-relaxed">
                {session.description}
              </p>
            </CardBody>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                Participants ({currentParticipants}/{session.maxParticipants})
                {wsConnected && hasRecentActivity && (
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                )}
              </h3>
              <p className="text-default-500 text-sm">
                Active contributors to this training session
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Progress value={participationProgress} className="w-full" />
                
                <div className="space-y-3">
                  {session.participants.map((participant, index) => (
                    <div key={participant.address} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar name={(index + 1).toString()} size="sm" />
                        <div>
                          <div className="font-medium">
                            {formatAddress(participant.address)}
                            {participant.address === account?.address.toString() && (
                              <Chip variant="bordered" size="sm" className="ml-2">You</Chip>
                            )}
                          </div>
                          <div className="text-sm text-default-500">
                            Joined {new Date(participant.joinedAt).toLocaleDateString()}
                          </div>
                          {participant.contribution && (
                            <div className="text-sm text-default-500">
                              {participant.contribution}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{participant.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {session.currentParticipants === 0 && (
                  <div className="text-center py-8 text-default-500">
                    No participants yet. Be the first to join!
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Actions</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {!connected ? (
                <div className="flex items-center gap-2 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-warning-800">
                    Connect your wallet to participate
                  </span>
                </div>
              ) : isParticipant ? (
                <div className="flex items-center gap-2 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success-600" />
                  <span className="text-success-800">
                    You are participating in this session
                  </span>
                </div>
              ) : canJoin ? (
                <Button 
                  onPress={handleJoinSession} 
                  isDisabled={isJoining}
                  className="w-full"
                  color="primary"
                  startContent={isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                >
                  {isJoining ? 'Joining...' : 'Join Session'}
                </Button>
              ) : session.status === 'completed' ? (
                <div className="flex items-center gap-2 p-4 bg-default-50 border border-default-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-default-500" />
                  <span className="text-default-700">
                    This session has been completed
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-default-50 border border-default-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-default-500" />
                  <span className="text-default-700">
                    Session is full or not accepting participants
                  </span>
                </div>
              )}

              {isCreator && session.status === 'active' && (
                <Button 
                  variant="bordered" 
                  onPress={handleCompleteSession}
                  isDisabled={isCompleting}
                  className="w-full"
                  startContent={isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                >
                  {isCompleting ? 'Completing...' : 'Complete Session'}
                </Button>
              )}
            </CardBody>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Session Details</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Reward Pool</span>
                </div>
                <span className="font-medium">{formatReward(session.rewardAmount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Stake Amount</span>
                </div>
                <span className="font-medium">{formatReward(session.stakeAmount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Duration</span>
                </div>
                <span className="font-medium">{formatDuration(session.duration)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span>Created</span>
                </div>
                <span className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>

              {session.completedAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-medium">{new Date(session.completedAt).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-500" />
                  <span>Progress</span>
                </div>
                <span className="font-medium">{participationProgress.toFixed(0)}%</span>
              </div>
            </CardBody>
          </Card>

          {/* User Score (if participating) */}
          {userParticipation && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Your Contribution</h3>
              </CardHeader>
              <CardBody>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-yellow-600">
                    {userParticipation.score}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Contribution Score
                  </div>
                  {userParticipation.contribution && (
                    <div className="text-sm bg-default-100 p-2 rounded">
                      {userParticipation.contribution}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}