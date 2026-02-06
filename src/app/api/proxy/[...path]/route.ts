import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${BACKEND_URL}/${path}`;
  const contentType = request.headers.get('content-type') || '';

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });
  // Skip ngrok browser warning for proxied requests
  headers.set('ngrok-skip-browser-warning', 'true');

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Handle multipart/form-data (file uploads) with binary data
    if (contentType.includes('multipart/form-data')) {
      const buffer = await request.arrayBuffer();
      console.log(`[Proxy] ${path} - multipart body size: ${buffer.byteLength} bytes`);
      init.body = buffer;
    } else {
      const body = await request.text();
      if (body) {
        init.body = body;
      }
    }
  }

  try {
    console.log(`[Proxy] Forwarding ${request.method} to ${url}`);
    const response = await fetch(url, init);
    const data = await response.arrayBuffer();

    console.log(`[Proxy] Response status: ${response.status}, size: ${data.byteLength} bytes`);

    // Forward error response body for debugging
    if (response.status >= 400) {
      const errorText = new TextDecoder().decode(data);
      console.log(`[Proxy] Error response: ${errorText}`);
    }

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join('/'));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join('/'));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join('/'));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join('/'));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join('/'));
}
