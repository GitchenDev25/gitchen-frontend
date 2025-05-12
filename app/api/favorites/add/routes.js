// /app/api/favorites/add/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, mealId, mealName } = body;

    if (!userId || !mealId || !mealName) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const favorites = db.collection('favorites');

    const existing = await favorites.findOne({ userId, mealId });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Already in favorites' }, { status: 409 });
    }

    await favorites.insertOne({
      userId,
      mealId,
      mealName,
      addedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Favorite added successfully' }, { status: 201 });

  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
