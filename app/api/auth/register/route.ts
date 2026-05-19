import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Проверяем, существует ли пользователь
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Хешируем пароль
    const hash = await bcrypt.hash(password, 10)

    // Создаем пользователя
    const userResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role_id) 
       VALUES ($1, $2, $3, 3) 
       RETURNING id, name, email`,
      [name, email, hash]
    )

    const userId = userResult.rows[0].id

    console.log('User created with ID:', userId)

    // Создаем три журнала для пользователя
    const journals = [
      { name: 'Убытие', description: 'Журнал учета продуктов, которые были взяты из холодильника' },
      { name: 'Принятие', description: 'Журнал учета добавленных продуктов в холодильник' },
      { name: 'Перемещение', description: 'Журнал учета перемещения продуктов между холодильниками' },
    ]

    for (const journal of journals) {
      await db.query(
        `INSERT INTO journals (name, description, user_id) 
         VALUES ($1, $2, $3)`,
        [journal.name, journal.description, userId]
      )
      console.log('Journal created:', journal.name)
    }

    return NextResponse.json({ user: userResult.rows[0] })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}