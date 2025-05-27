import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://44.202.123.117:8000';

export async function POST() {
  try {
    console.log('Proxy: Creating session via', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Proxy: API response not ok:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API server error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Proxy: Session created successfully:', data);
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorObj = error as Error & { code?: string };
    console.warn('Proxy: Failed to create session:', errorObj);
    
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
