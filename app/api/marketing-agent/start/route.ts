import { NextResponse } from 'next/server';
import { startMarketingAgent } from '@/utils/marketing-agent/marketing-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appName, appUrl, max_personas = 3, competitor_hint } = body;

    if (!appName || !appUrl) {
      return NextResponse.json(
        { error: 'appName and appUrl are required' },
        { status: 400 }
      );
    }

    const response = await startMarketingAgent({
      appName,
      appUrl,
      max_personas,
      competitor_hint
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error starting marketing agent:', error);
    return NextResponse.json(
      { error: 'Failed to start marketing agent' },
      { status: 500 }
    );
  }
}
