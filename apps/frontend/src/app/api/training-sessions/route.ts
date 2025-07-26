import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// 数据库配置
const DATABASE_CONFIG = {
  connectionString: "postgresql://neondb_owner:npg_nTW4uba6QUVh@ep-proud-sound-adfv8vvs-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
};

// 创建数据库连接
const createConnection = async () => {
  const client = new Client(DATABASE_CONFIG);
  await client.connect();
  return client;
};

// POST - 创建训练会话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      name,
      description,
      creator_address,
      max_participants,
      reward_amount,
      stake_amount,
      duration,
      transaction_hash
    } = body;

    const client = await createConnection();
    
    try {
      const insertQuery = `
        INSERT INTO training_sessions (
          session_id, name, description, creator_address, 
          max_participants, reward_amount, stake_amount, duration, 
          transaction_hash
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING id;
      `;
      
      const values = [
        session_id,
        name,
        description,
        creator_address,
        max_participants,
        reward_amount,
        stake_amount,
        duration,
        transaction_hash || null
      ];
      
      const result = await client.query(insertQuery, values);
      
      return NextResponse.json({
        success: true,
        id: result.rows[0].id,
        message: 'Training session created successfully'
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error creating training session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create training session' },
      { status: 500 }
    );
  }
}

// GET - 获取训练会话
export async function GET(request: Request) {
  try {
    const conn = await createConnection();
    if (!conn) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const query = `
      SELECT 
        session_id as id,
        name,
        description,
        reward_amount as "rewardAmount",
        stake_amount as "stakeAmount",
        max_participants as "maxParticipants",
        current_participants as "currentParticipants",
        duration,
        status,
        created_at as "createdAt",
        completed_at as "completedAt",
        creator_address as creator,
        transaction_hash as "transactionHash"
      FROM training_sessions 
      ORDER BY created_at DESC
    `;
    
    const result = await conn.query(query);
    await conn.end();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('获取训练会话失败:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sessions',
      details: error.message 
    }, { status: 500 });
  }
}