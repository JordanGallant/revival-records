// app/api/proxy/route.ts (for App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the URL from the query parameter
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  
  try {
    // Fetch the audio file from S3
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // Get the response as an array buffer
    const buffer = await response.arrayBuffer();
    
    // Create headers for the response
    const headers = new Headers();
    
    // Set content type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    } else {
      // Default to audio/mpeg if no content type is provided
      headers.set('Content-Type', 'audio/mpeg');
    }
    
    // Set content length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    // Set headers to allow range requests for better audio streaming
    headers.set('Accept-Ranges', 'bytes');
    
    // Return the proxied content
    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch the resource' }, { status: 500 });
  }
}