import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUserFromRequest';

// Получить журналы пользователя
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromRequest();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await db.query(
      `SELECT id, name, description, user_id, created_at, updated_at 
       FROM journals 
       WHERE user_id = $1 
       ORDER BY created_at ASC`,
      [auth.userId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 });
  }
}

// Создать журналы для пользователя (вызывается при регистрации)
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromRequest();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Создаем три журнала по умолчанию
    const journals = [
      { name: 'Убытие', description: 'Журнал учета продуктов, которые были взяты из холодильника' },
      { name: 'Принятие', description: 'Журнал учета добавленных продуктов в холодильник' },
      { name: 'Перемещение', description: 'Журнал учета перемещения продуктов между холодильниками' },
    ];
    
    const createdJournals = [];
    for (const journal of journals) {
      const result = await db.query(
        `INSERT INTO journals (name, description, user_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [journal.name, journal.description, auth.userId]
      );
      createdJournals.push(result.rows[0]);
    }
    
    return NextResponse.json(createdJournals);
  } catch (error) {
    console.error('Error creating journals:', error);
    return NextResponse.json({ error: 'Failed to create journals' }, { status: 500 });
  }
}