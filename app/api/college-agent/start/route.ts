import { NextResponse } from 'next/server';
import { startCollegeAgent } from '@/utils/college-agent/college-client';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      major,
      location_preference,
      max_tuition,
      min_acceptance_rate,
      max_colleges = 5,
      sat_score,
      search_query
    } = body;

    const response = await startCollegeAgent({
      major,
      location_preference,
      max_tuition,
      min_acceptance_rate,
      max_colleges,
      sat_score,
      search_query
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error starting college finder agent:', error);
    return NextResponse.json(
      { error: 'Failed to start college finder agent' },
      { status: 500 }
    );
  }
} 