import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString(),
    botTokenExists: !!process.env.TELEGRAM_BOT_TOKEN
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Test POST endpoint is working!',
      data: body,
      botTokenExists: !!process.env.TELEGRAM_BOT_TOKEN
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Error processing request',
      error: error.message
    }, { status: 500 });
  }
}