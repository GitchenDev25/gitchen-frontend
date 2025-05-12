// app/api/test-mongo/route.js
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('gitchen_db'); // use your actual DB name
    const collections = await db.listCollections().toArray();

    return Response.json({
      message: 'Successfully connected to MongoDB!',
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Connection failed' }), { status: 500 });
  }
}
