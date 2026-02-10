// Server-side: Trello Build/Jobs board data
import { NextResponse } from 'next/server';
import { TrelloService } from '@/lib/api/trello';

function getEnv() {
  const apiKey = process.env.TRELLO_API_KEY || '';
  const token = process.env.TRELLO_TOKEN || '';
  const buildBoardId = process.env.TRELLO_BUILD_BOARD_ID || process.env.BUILD_BOARD_ID || '';
  return { apiKey, token, buildBoardId };
}

export async function GET() {
  const { apiKey, token, buildBoardId } = getEnv();

  if (!apiKey || !token) {
    return NextResponse.json(
      { error: 'Trello credentials not configured. Set TRELLO_API_KEY and TRELLO_TOKEN in environment.' },
      { status: 503 }
    );
  }

  if (!buildBoardId) {
    return NextResponse.json(
      { error: 'Build Board ID not configured. Set TRELLO_BUILD_BOARD_ID or BUILD_BOARD_ID in environment.' },
      { status: 503 }
    );
  }

  try {
    const service = new TrelloService({ apiKey, token, buildBoardId });
    const boardData = await service.getFullBoardData(buildBoardId);
    return NextResponse.json(boardData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('401') ? 401 : message.includes('403') ? 403 : message.includes('404') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
