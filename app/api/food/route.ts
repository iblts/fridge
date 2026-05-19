import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, quantity, fridgeId, expiration_date, unit_symbol } = body;
    
    const result = await db.query(
      `INSERT INTO foods (name, quantity, fridge_id, expiration_date, unit_symbol) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, quantity, fridgeId, expiration_date || null, unit_symbol || 'шт']
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding food:', error);
    return NextResponse.json({ error: 'Failed to add food' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fridgeId = searchParams.get('fridgeId');
    
    if (!fridgeId) {
      return NextResponse.json({ error: 'fridgeId is required' }, { status: 400 });
    }
    
    const result = await db.query(
      `SELECT * FROM foods WHERE fridge_id = $1 ORDER BY created_at DESC`,
      [fridgeId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, quantity, expiration_date } = body;
    
    const result = await db.query(
      `UPDATE foods 
       SET name = COALESCE($1, name), 
           quantity = COALESCE($2, quantity), 
           expiration_date = COALESCE($3, expiration_date)
       WHERE id = $4
       RETURNING *`,
      [name, quantity, expiration_date, id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating food:', error);
    return NextResponse.json({ error: 'Failed to update food' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const foodId = searchParams.get('id');
    
    if (!foodId) {
      return NextResponse.json({ error: 'Food id is required' }, { status: 400 });
    }
    
    const result = await db.query(
      `DELETE FROM foods WHERE id = $1 RETURNING *`,
      [foodId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Food deleted successfully', food: result.rows[0] });
  } catch (error) {
    console.error('Error deleting food:', error);
    return NextResponse.json({ error: 'Failed to delete food' }, { status: 500 });
  }
}