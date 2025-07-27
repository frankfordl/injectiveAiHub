import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

const DATABASE_CONFIG = {
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_nTW4uba6QUVh@ep-proud-sound-adfv8vvs-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, transaction_hash } = body;

    const client = new Client(DATABASE_CONFIG);
    await client.connect();
    
    try {
      const updateQuery = `
        UPDATE training_sessions 
        SET stake_verified = true, transaction_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $2
        RETURNING *;
      `;
      
      const result = await client.query(updateQuery, [transaction_hash, session_id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Stake verification updated successfully'
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error updating stake verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stake verification' },
      { status: 500 }
    );
  }
}