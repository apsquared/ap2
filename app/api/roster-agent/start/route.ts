import { NextResponse } from 'next/server';
import { startTeamRosterAgent } from '@/utils/team-roster-client/team-roster-client';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { college_name } = body;

    const response = await startTeamRosterAgent({
      college_name
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error starting team roster agent:', error);
    return NextResponse.json(
      { error: 'Failed to start team roster agent' },
      { status: 500 }
    );
  }
} 