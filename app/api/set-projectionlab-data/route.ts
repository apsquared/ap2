import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../utils/db/mymongo';

const PROJECTION_LAB_DB = 'projection_lab_db';
const PROJECTION_LAB_COLLECTION = 'user_data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, data } = body;

    // Validate required fields
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Data field is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const collection = client.db(PROJECTION_LAB_DB).collection(PROJECTION_LAB_COLLECTION);

    // Perform upsert operation
    const result = await collection.findOneAndUpdate(
      { apiKey: apiKey },
      { 
        $set: { 
          data: data,
          lastUpdated: new Date()
        },
        $setOnInsert: {
          apiKey: apiKey,
          createdAt: new Date()
        }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    );

    if (!result) {
      throw new Error('Failed to upsert Projection Lab data');
    }

    const wasCreated = !result.lastUpdated || result.createdAt?.getTime() === result.lastUpdated?.getTime();
    console.log(`${wasCreated ? 'Created' : 'Updated'} Projection Lab data for API key:`, apiKey.substring(0, 8) + '...');

    return NextResponse.json({
      success: true,
      message: wasCreated ? 'Projection Lab data created successfully' : 'Projection Lab data updated successfully',
      receivedAt: new Date().toISOString(),
      recordId: result._id
    });

  } catch (error) {
    console.error('Error processing Projection Lab data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
