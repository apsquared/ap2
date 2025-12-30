import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    
    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_TAX_URL;
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_TAX_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: address.trim() }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned status ${response.status}`);
    }
    const clonedResponse = response.clone();
    const rawBody = await clonedResponse.text();
    console.log('Raw response body from tax info webhook:', rawBody);

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling n8n webhook (Load Tax Info):', error);
    return NextResponse.json(
      { error: 'Failed to load tax info' },
      { status: 500 }
    );
  }
}

