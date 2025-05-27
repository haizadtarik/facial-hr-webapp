import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: 'API base URL not configured' },
        { status: 500 }
      );
    }

    const apiUrl = `${API_BASE_URL}/session/${sessionId}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle 404 as success - session already doesn't exist
      if (response.status === 404) {
        return NextResponse.json(
          { message: 'Session already deleted or does not exist' },
          { status: 200 }
        );
      }
      
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy delete session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
