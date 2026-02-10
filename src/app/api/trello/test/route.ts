// Server-side: Test Trello connections for both boards
import { NextResponse } from 'next/server';
import { TrelloService } from '@/lib/api/trello';

function getEnv() {
  const apiKey = process.env.TRELLO_API_KEY || '';
  const token = process.env.TRELLO_TOKEN || '';
  const salesBoardId = process.env.TRELLO_SALES_BOARD_ID || process.env.SALES_BOARD_ID || '';
  const buildBoardId = process.env.TRELLO_BUILD_BOARD_ID || process.env.BUILD_BOARD_ID || '';
  return { apiKey, token, salesBoardId, buildBoardId };
}

export async function GET() {
  const { apiKey, token, salesBoardId, buildBoardId } = getEnv();

  if (!apiKey || !token) {
    return NextResponse.json(
      { error: 'Trello credentials not configured.', sales: false, build: false },
      { status: 503 }
    );
  }

  try {
    const service = new TrelloService({ apiKey, token, salesBoardId, buildBoardId });
    const results = await service.testAllConnections();
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ sales: false, build: false }, { status: 500 });
  }
}
