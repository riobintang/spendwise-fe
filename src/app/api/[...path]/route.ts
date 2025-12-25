import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// This is a catch-all API route that proxies requests to the Express backend
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  try {
    // Build the backend URL - remove /api prefix
    const backendPath = pathname.replace('/api', '');
    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}${backendPath}${queryString ? `?${queryString}` : ''}`;

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    const body = await request.json();

    // Build the backend URL - remove /api prefix
    const backendPath = pathname.replace('/api', '');
    const backendUrl = `${BACKEND_URL}${backendPath}`;

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  try {
    const body = await request.json();

    // Build the backend URL - remove /api prefix
    const backendPath = pathname.replace('/api', '');
    const backendUrl = `${BACKEND_URL}${backendPath}`;

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  try {
    // Build the backend URL - remove /api prefix
    const backendPath = pathname.replace('/api', '');
    const backendUrl = `${BACKEND_URL}${backendPath}`;

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
