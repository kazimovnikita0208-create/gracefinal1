import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Test POST endpoint is working',
    timestamp: new Date().toISOString()
  });
}



