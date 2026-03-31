import { handleAINewsGet, handleAINewsPost } from './shared';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  return handleAINewsGet(searchParams);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-ingest-token');

  // Validate ingest token
  if (authHeader !== process.env.N8N_AI_NEWS_INGEST_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handleAINewsPost(request);
}
