// API客户端
export interface TrainingSessionData {
  session_id: string;
  name: string;
  description: string;
  creator_address: string;
  model_code: string;
  max_participants: number;
  reward_amount: number;
  stake_amount: number;
  duration: number;
  transaction_hash?: string;
}

// 创建训练会话
export const createTrainingSession = async (sessionData: TrainingSessionData) => {
  try {
    const response = await fetch('/api/training-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating training session:', error);
    throw error;
  }
};

// 获取训练会话
export const getTrainingSession = async (sessionId?: string) => {
  try {
    const url = sessionId 
      ? `/api/training-sessions?session_id=${sessionId}`
      : '/api/training-sessions';
    
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching training session:', error);
    throw error;
  }
};

// 更新质押验证
export const updateStakeVerification = async (sessionId: string, transactionHash: string) => {
  try {
    const response = await fetch('/api/training-sessions/verify', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        transaction_hash: transactionHash,
      }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating stake verification:', error);
    throw error;
  }
};