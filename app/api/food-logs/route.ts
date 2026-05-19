import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Записать действие в журнал
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action_type,
      product_name,
      quantity,
      unit_symbol,
      from_fridge_id,
      to_fridge_id,
      user_id,
      user_name,
      fridge_name,
    } = body;
    
    const result = await db.query(
      `INSERT INTO food_logs 
       (action_type, product_name, quantity, unit_symbol, from_fridge_id, to_fridge_id, user_id, user_name, fridge_name, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING *`,
      [action_type, product_name, quantity, unit_symbol, from_fridge_id, to_fridge_id, user_id, user_name, fridge_name]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating food log:', error);
    return NextResponse.json({ error: 'Failed to create food log' }, { status: 500 });
  }
}