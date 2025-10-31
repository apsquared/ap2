import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../utils/db/mymongo';

const PROJECTION_LAB_DB = 'projection_lab_db';
const PROJECTION_LAB_COLLECTION = 'user_data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    // Validate required fields
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const collection = client.db(PROJECTION_LAB_DB).collection(PROJECTION_LAB_COLLECTION);

    // Find document by API key
    const document = await collection.findOne({ apiKey: apiKey });

    if (!document) {
      return NextResponse.json(
        { error: 'No data found for the provided API key' },
        { status: 404 }
      );
    }

    console.log('Retrieved Projection Lab data for API key:', apiKey.substring(0, 8) + '...');

    return NextResponse.json({
      success: true,
      data: document.data,
      lastUpdated: document.lastUpdated,
      createdAt: document.createdAt,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving Projection Lab data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
