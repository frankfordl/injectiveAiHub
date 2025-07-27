'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Input, Textarea, Chip } from '@heroui/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { useToast } from '@/components/cotrain/ui/use-toast';
// 修复导入：使用正确的hook名称
import { useEthereumContract } from '@/hooks/useEthereumContract';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { useWallet } from '@/components/WalletProvider';
import { Loader2, ArrowLeft, Plus, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { createTrainingSession as createSessionInDB, updateStakeVerification } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

interface SessionFormData {
  name: string;
  description: string;
  maxParticipants: number;
  duration: number;
  modelCode: string; // PyTorch代码字段
  stakeAmount: number; // 质押金额字段，同时也是奖励池
}

interface SessionFormErrors {
  name?: string;
  description?: string;
  maxParticipants?: string;
  duration?: string;
  modelCode?: string;
  stakeAmount?: string;
}

export default function CreateTrainingSession() {
  const router = useRouter();
  const { toast: toastHook } = useToast();
  const { isConnected: connected } = useWallet();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // 修复：使用正确的hook名称
  // 第42行：从 useEthereumContract hook 中解构获取 error
  const { createTrainingSession, isLoading, error } = useEthereumContract();
  const { trackTransaction, pendingTransactions } = useTransactionStatus();

  // 添加 useRef 用于 textarea 自动调整高度
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<SessionFormData>({
    name: '',
    description: '',
    maxParticipants: 10,
    duration: 3600,
    modelCode: `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass SimpleModel(nn.Module):\n    def __init__(self, input_size, hidden_size, output_size):\n        super(SimpleModel, self).__init__()\n        self.fc1 = nn.Linear(input_size, hidden_size)\n        self.fc2 = nn.Linear(hidden_size, output_size)\n        \n    def forward(self, x):\n        x = F.relu(self.fc1(x))\n        x = self.fc2(x)\n        return x\n\n# 模型实例化\nmodel = SimpleModel(784, 128, 10)`,
    stakeAmount: 0.01, // 修改默认值为 0.01
  });

  const [confirmStake, setConfirmStake] = useState(false);

  const [formErrors, setFormErrors] = useState<SessionFormErrors>({});

  const validateForm = (): boolean => {
    const errors: SessionFormErrors = {};
  
    if (!formData.name.trim()) {
      errors.name = 'Session name is required';
      toast.error('会话名称是必填项');
    } else if (formData.name.length < 3) {
      errors.name = 'Session name must be at least 3 characters';
      toast.error('会话名称必须至少3个字符');
    }
  
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      toast.error('描述是必填项');
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
      toast.error('描述必须至少10个字符');
    }
  
    // PyTorch代码验证
    if (!formData.modelCode.trim()) {
      errors.modelCode = 'PyTorch model code is required';
      toast.error('PyTorch模型代码是必填项');
    } else if (!formData.modelCode.includes('torch') || !formData.modelCode.includes('nn.Module')) {
      errors.modelCode = 'Please provide valid PyTorch model code with nn.Module';
      toast.error('请提供包含nn.Module的有效PyTorch模型代码');
    }
  
    // 质押金额验证（同时也是奖励池）
    if (formData.stakeAmount <= 0) {
      errors.stakeAmount = 'Stake amount must be greater than 0';
      toast.error('质押金额必须大于0');
    } else if (formData.stakeAmount < 0.01) { // 添加最小值检查
      errors.stakeAmount = 'Stake amount must be at least 0.01 INJ';
      toast.error('质押金额最少为0.01 INJ');
    } else if (formData.stakeAmount > 1000) {
      errors.stakeAmount = 'Stake amount cannot exceed 1,000 INJ';
      toast.error('质押金额不能超过1,000 INJ');
    }
  
    if (formData.maxParticipants < 1) {
      errors.maxParticipants = 'Must allow at least 1 participant';
      toast.error('必须允许至少1个参与者');
    } else if (formData.maxParticipants > 1000) {
      errors.maxParticipants = 'Cannot exceed 1,000 participants';
      toast.error('参与者数量不能超过1,000');
    }
  
    if (formData.duration < 300) {
      errors.duration = 'Duration must be at least 5 minutes (300 seconds)';
      toast.error('持续时间必须至少5分钟（300秒）');
    } else if (formData.duration > 86400 * 7) {
      errors.duration = 'Duration cannot exceed 7 days';
      toast.error('持续时间不能超过7天');
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof SessionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 添加钱包连接检查函数
  const handleWalletCheck = () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      onOpen();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 使用新的钱包检查方法
    if (!handleWalletCheck()) {
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    if (!confirmStake) {
      toast.error('Please confirm the stake amount before proceeding.');
      return;
    }

    try {
      // 生成唯一的会话ID
      const sessionId = uuidv4();
      
      // 首先保存到数据库（未验证状态）
      const sessionData = {
        session_id: sessionId,
        name: formData.name,
        description: formData.description,
        creator_address: '', // 从钱包获取地址
        model_code: formData.modelCode,
        max_participants: formData.maxParticipants,
        reward_amount: formData.stakeAmount, // 奖励池等于质押金额
        stake_amount: formData.stakeAmount,
        duration: formData.duration,
      };
      
      // 保存到数据库
      const dbResult = await createSessionInDB(sessionData);
      
      if (!dbResult.success) {
        toast.error('Failed to save session to database');
        return;
      }
      
      toast.success('Session saved to database successfully!');
      
      // 然后进行区块链质押验证
      const blockchainResult = await createTrainingSession({
        name: formData.name,
        description: formData.description,
        rewardAmount: formData.stakeAmount,
        maxParticipants: formData.maxParticipants,
        duration: formData.duration,
      });
  
      if (blockchainResult.success && blockchainResult.hash) {
        // 更新数据库中的质押验证状态
        await updateStakeVerification(sessionId, blockchainResult.hash);
        
        await trackTransaction(blockchainResult.hash, 'create_session', 'Creating training session');
  
        toast.success('Session creation completed! Training session created and stake verified.');
  
        setTimeout(() => {
          router.push('/training/sessions');
        }, 2000);
      } else {
        toast.warning('Session saved but stake verification failed. You can retry verification later.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="light"
            size="sm"
            onPress={() => router.back()}
            startContent={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Training Session</h1>
            <p className="text-default-400">
              Set up a new AI training session with rewards for participants
            </p>
          </div>
        </div>

        {/* Wallet Connection Status */}
        {!connected && (
          <Card className="mb-6 border-warning bg-warning-50">
            <CardBody className="flex flex-row items-center gap-3">
              <AlertCircle className="h-4 w-4 text-warning" />
              <div className="flex-1">
                <p className="text-warning-700">
                  You need to connect your wallet to create a training session.
                </p>
              </div>
              <Button
                color="warning"
                variant="flat"
                size="sm"
                onPress={onOpen}
              >
                Connect Wallet
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Pending Transactions */}
        {pendingTransactions.length > 0 && (
          <Card className="mb-6 border-primary bg-primary-50">
            <CardBody className="flex flex-row items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-primary-700">
                {pendingTransactions.length} transaction(s) pending...
              </p>
            </CardBody>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Session Details
            </h3>
            <p className="text-default-400">
              Configure your training session parameters
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Session Name *</label>
                <Input
                  id="name"
                  placeholder="e.g., Advanced NLP Model Training"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description *</label>
                <Textarea
                  id="description"
                  placeholder="Describe the training objectives, requirements, and expectations..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              {/* Stake Amount (也是奖励池) */}
              <div className="space-y-2">
                <label htmlFor="stakeAmount" className="text-sm font-medium">质押金额/奖励池 (INJ) *</label>
                <Input
                  id="stakeAmount"
                  type="number"
                  min="0.01" // 修改最小值为 0.01
                  max="1000"
                  step="0.01" // 修改步长为 0.01，支持小数点
                  placeholder="0.01" // 修改占位符为 0.01
                  value={formData.stakeAmount.toString()}
                  onChange={(e) => handleInputChange('stakeAmount', parseFloat(e.target.value) || 0)}
                  className={formErrors.stakeAmount ? 'border-red-500' : ''}
                />
                <p className="text-sm text-default-400">
                  创建算力池需要质押的 INJ，同时也是参与者的奖励池总额（最小值：0.01 INJ）
                </p>
                {formErrors.stakeAmount && (
                  <p className="text-sm text-red-500">{formErrors.stakeAmount}</p>
                )}
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <label htmlFor="maxParticipants" className="text-sm font-medium">Maximum Participants *</label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="10"
                  value={formData.maxParticipants.toString()}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 0)}
                  className={formErrors.maxParticipants ? 'border-red-500' : ''}
                />
                {formErrors.maxParticipants && (
                  <p className="text-sm text-red-500">{formErrors.maxParticipants}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Session Duration (seconds) *</label>
                <Input
                  id="duration"
                  type="number"
                  min="300"
                  max="604800"
                  placeholder="3600"
                  value={formData.duration.toString()}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className={formErrors.duration ? 'border-red-500' : ''}
                />
                <p className="text-sm text-default-400">
                  Duration: {formatDuration(formData.duration)} (Min: 5 minutes, Max: 7 days)
                </p>
                {formErrors.duration && (
                  <p className="text-sm text-red-500">{formErrors.duration}</p>
                )}
              </div>

              {/* PyTorch Model Code */}
              <div className="space-y-2">
                <label htmlFor="modelCode" className="text-sm font-medium flex items-center gap-2">
                  <span>PyTorch 模型代码 *</span>
                  <Chip size="sm" color="primary" variant="flat">Python</Chip>
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="modelCode"
                    placeholder="请输入您的PyTorch模型代码..."
                    value={formData.modelCode}
                    onChange={(e) => {
                      handleInputChange('modelCode', e.target.value);
                      // Auto-resize textarea
                      if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                      }
                    }}
                    className={`w-full min-h-[200px] p-3 border rounded-lg font-mono text-sm resize-none ${
                      formErrors.modelCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => {
                        navigator.clipboard.writeText(formData.modelCode);
                        toast.success('代码已复制到剪贴板');
                      }}
                    >
                      复制
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="warning"
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          modelCode: `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass SimpleModel(nn.Module):\n    def __init__(self, input_size, hidden_size, output_size):\n        super(SimpleModel, self).__init__()\n        self.fc1 = nn.Linear(input_size, hidden_size)\n        self.fc2 = nn.Linear(hidden_size, output_size)\n        \n    def forward(self, x):\n        x = F.relu(self.fc1(x))\n        x = self.fc2(x)\n        return x\n\n# 模型实例化\nmodel = SimpleModel(784, 128, 10)`
                        }));
                      }}
                    >
                      重置
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-default-400">
                  <span>• 必须包含 torch 和 nn.Module</span>
                  <span>• 支持完整的PyTorch模型定义</span>
                  <span>• 包含forward方法</span>
                </div>
                {formErrors.modelCode && (
                  <p className="text-sm text-red-500">{formErrors.modelCode}</p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-danger bg-danger-50">
                  <CardBody className="flex flex-row items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <p className="text-danger-700">{error}</p>
                  </CardBody>
                </Card>
              )}

              {/* Stake Confirmation */}
              <Card className="border-warning bg-warning-50">
                <CardBody>
                  <h4 className="font-semibold text-warning-800 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    质押确认
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-warning-800">质押金额:</span>
                        <p className="text-warning-700">{formData.stakeAmount} INJ</p>
                      </div>
                      <div>
                        <span className="font-medium text-warning-800">奖励池:</span>
                        <p className="text-warning-700">{formData.stakeAmount} INJ</p>
                      </div>
                    </div>
                    <p className="text-warning-700 text-sm">
                      您将质押 <strong>{formData.stakeAmount} INJ</strong> 来创建此算力池。
                      质押的代币将在会话完成后根据参与情况和训练质量返还。
                    </p>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="confirmStake"
                        checked={confirmStake}
                        onChange={(e) => setConfirmStake(e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor="confirmStake" className="text-sm text-warning-800 cursor-pointer">
                        我确认质押 {formData.stakeAmount} INJ 并了解相关风险。我理解质押代币的返还取决于训练会话的完成情况和参与者的贡献质量。
                      </label>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="bordered"
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="flex-1"
                  startContent={<Plus className="h-4 w-4" />}
                  isDisabled={!connected || !confirmStake || isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Training Session'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Preview Card */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">预览</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">会话名称:</span>
                <p className="text-default-400">{formData.name || '未命名会话'}</p>
              </div>
              <div>
                <span className="font-medium">奖励池:</span>
                <p className="text-default-400">{formData.stakeAmount} INJ</p>
              </div>
              <div>
                <span className="font-medium">质押金额:</span>
                <p className="text-default-400">{formData.stakeAmount} INJ</p>
              </div>
              <div>
                <span className="font-medium">最大参与者:</span>
                <p className="text-default-400">{formData.maxParticipants} 人</p>
              </div>
              <div>
                <span className="font-medium">持续时间:</span>
                <p className="text-default-400">{formatDuration(formData.duration)}</p>
              </div>
              <div>
                <span className="font-medium">模型代码:</span>
                <p className="text-default-400">{formData.modelCode.length} 字符</p>
              </div>
            </div>
            {formData.description && (
              <div>
                <span className="font-medium">描述:</span>
                <p className="text-default-400 text-sm mt-1">{formData.description}</p>
              </div>
            )}
            {formData.modelCode && (
              <div>
                <span className="font-medium">PyTorch模型预览:</span>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto max-h-32">
                  <code>{formData.modelCode.substring(0, 200)}...</code>
                </pre>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Wallet Connection Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Connect Your Wallet
              </ModalHeader>
              <ModalBody>
                <p>
                  Please connect your wallet to create a training session. 
                  You'll need to stake INJ tokens and pay for transaction fees.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  I'll Connect Later
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}