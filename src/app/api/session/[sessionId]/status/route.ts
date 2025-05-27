import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://44.202.123.117:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionId;
    console.log('Proxy: Getting session status for', sessionId, 'via', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Proxy: API response not ok:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API server error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Proxy: Session status retrieved successfully');
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorObj = error as Error & { code?: string };
    console.warn('Proxy: Failed to get session status:', errorObj);
    
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
