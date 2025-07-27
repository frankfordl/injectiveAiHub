import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Database configuration
const DATABASE_CONFIG = {
  connectionString: "postgresql://neondb_owner:npg_nTW4uba6QUVh@ep-proud-sound-adfv8vvs-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
};

// Create database connection
const createConnection = async () => {
  const client = new Client(DATABASE_CONFIG);
  await client.connect();
  return client;
};

// GET - Get individual training session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;
    
    const conn = await createConnection();
    if (!conn) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const query = `
      SELECT 
        session_id as id,
        name,
        description,
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
      WHERE session_id = $1
    `;
    
    const result = await conn.query(query, [sessionId]);
    await conn.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('获取训练会话详情失败:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch session details',
      details: error.message 
    }, { status: 500 });
  }
}