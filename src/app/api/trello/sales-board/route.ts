// Server-side: Trello Sales/Estimates board data
import { NextResponse } from 'next/server';
import { TrelloService } from '@/lib/api/trello';

function getEnv() {
  const apiKey = process.env.TRELLO_API_KEY || '';
  const token = process.env.TRELLO_TOKEN || '';
  const salesBoardId = process.env.TRELLO_SALES_BOARD_ID || process.env.SALES_BOARD_ID || '';
  return { apiKey, token, salesBoardId };
}

export async function GET() {
  const { apiKey, token, salesBoardId } = getEnv();

  if (!apiKey || !token) {
    return NextResponse.json(
      { error: 'Trello credentials not configured. Set TRELLO_API_KEY and TRELLO_TOKEN in environment.' },
      { status: 503 }
    );
  }

  if (!salesBoardId) {
    return NextResponse.json(
      { error: 'Sales Board ID not configured. Set TRELLO_SALES_BOARD_ID or SALES_BOARD_ID in environment.' },
      { status: 503 }
    );
  }

  try {
    const service = new TrelloService({ apiKey, token, salesBoardId });
    const boardData = await service.getFullBoardData(salesBoardId);
    return NextResponse.json(boardData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('401') ? 401 : message.includes('403') ? 403 : message.includes('404') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
