'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Alert,
} from '@heroui/react';
import {
  Plus,
  Search,
  Filter,
  Trophy,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/cotrain/ui/use-toast';
import { useEthereumContract } from '@/hooks/useEthereumContract';

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
  stakeAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  duration: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  creator: string;
  modelCode: string;
  stakeVerified: boolean;
  transactionHash?: string;
}

type SessionStatus = 'all' | 'active' | 'completed' | 'pending';

export default function TrainingSessions() {
  const router = useRouter();
  const { toast } = useToast();
  const { connected, account } = useEthereumContract();

  const [sessions, setSessions] = useState<SessionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('all');
  const [error, setError] = useState<string | null>(null);

  // 从数据库获取训练会话数据
  const fetchSessionsFromDB = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/training-sessions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSessions(data);
      console.log('获取到的会话数据:', data);
    } catch (error) {
      console.error('获取会话数据失败:', error);
      setError(error.message);
      toast({
        title: '获取数据失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchSessionsFromDB();
  }, []);

  // 手动刷新数据
  const handleRefresh = async () => {
    await fetchSessionsFromDB();
    toast({
      title: '数据刷新成功',
      variant: 'default'
    });
  };

  // Filter sessions based on search and status
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip color="success" variant="flat">Active</Chip>;
      case 'completed':
        return <Chip color="default" variant="flat">Completed</Chip>;
      case 'pending':
        return <Chip variant="bordered">Pending</Chip>;
      default:
        return <Chip variant="bordered">{status}</Chip>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'completed':
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      default:
        return '';
    }
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
    return `${(numAmount || 0).toFixed(4)} ETH`;
  };

  const formatStake = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(numAmount || 0).toFixed(4)} INJ`;
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/training/sessions/${sessionId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Training Sessions</h1>
          <p className="text-default-400">
            从 Neon PostgreSQL 数据库获取的训练会话数据
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="bordered" 
            onPress={handleRefresh}
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新数据
          </Button>
          <Button onPress={() => router.push('/training/create')} isDisabled={!connected}>
            <Plus className="mr-2 h-4 w-4" />
            Create Session
          </Button>
        </div>
      </div>

      {/* 钱包连接状态提示 */}
      {!connected && (
        <Alert 
          color="warning" 
          variant="flat" 
          className="mb-6"
          startContent={<AlertCircle className="h-4 w-4" />}
        >
          Connect your MetaMask wallet to create sessions.
        </Alert>
      )}

      {/* 数据库错误提示 */}
      {error && (
        <Alert 
          color="danger" 
          variant="flat" 
          className="mb-6"
          startContent={<AlertCircle className="h-4 w-4" />}
        >
          数据库连接失败: {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-default-400" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select 
                selectedKeys={[statusFilter]} 
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as SessionStatus)}
                placeholder="Filter by status"
                startContent={<Filter className="h-4 w-4" />}
              >
                <SelectItem key="all">All Sessions</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sessions from database...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <div className="text-default-400">
              {searchQuery || statusFilter !== 'all' ? 
                'No sessions match your criteria.' : 
                '暂无训练会话数据。请先创建一个训练会话。'}
            </div>
            {connected && (
              <Button 
                variant="bordered" 
                className="mt-4"
                onPress={() => router.push('/training/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Session
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${getStatusColor(session.status)}`}
              onClick={() => handleSessionClick(session.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold line-clamp-2">{session.name}</h3>
                  {getStatusBadge(session.status)}
                </div>
                <p className="text-default-400 line-clamp-3">
                  {session.description}
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {/* Reward and Stake */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{formatStake(session.stakeAmount)}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{session.currentParticipants}/{session.maxParticipants} participants</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-sm text-default-400">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {formatDuration(session.duration)}</span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-1 text-sm text-default-400">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Creator Address */}
                  <div className="text-xs text-default-400">
                    Creator: {session.creator.slice(0, 6)}...{session.creator.slice(-4)}
                  </div>

                  {/* Stake Verification Status */}
                  {session.stakeVerified && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      ✓ Stake Verified
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      variant={session.status === 'active' ? 'solid' : 'bordered'} 
                      size="sm" 
                      className="w-full"
                      onPress={() => {
                        handleSessionClick(session.id);
                      }}
                    >
                      {session.status === 'active' ? 'Join Session' : 'View Details'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-default-500">Active Sessions</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.reduce((acc, s) => acc + s.currentParticipants, 0)}
            </div>
            <div className="text-sm text-default-500">Total Participants</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.reduce((acc, s) => {
                const amount = typeof s.stakeAmount === 'string' ? parseFloat(s.stakeAmount) : s.stakeAmount;
                return acc + (amount || 0);
              }, 0).toFixed(2)} INJ
            </div>
            <div className="text-sm text-default-500">Total Stakes</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-default-500">Completed</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}