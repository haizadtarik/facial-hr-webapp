import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://44.202.123.117:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxy: Analyzing image via', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn('Proxy: API response not ok:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API server error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Proxy: Image analyzed successfully');
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorObj = error as Error & { code?: string };
    console.warn('Proxy: Failed to analyze image:', errorObj);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to API server',
        details: errorObj.message,
        code: errorObj.code
      },
      { status: 500 }
    );
  }
}
