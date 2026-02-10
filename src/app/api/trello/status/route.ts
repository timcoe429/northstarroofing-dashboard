// Server-side: Whether Trello is configured via environment variables
import { NextResponse } from 'next/server';

function getEnv() {
  const apiKey = process.env.TRELLO_API_KEY || '';
  const token = process.env.TRELLO_TOKEN || '';
  const salesBoardId = process.env.TRELLO_SALES_BOARD_ID || process.env.SALES_BOARD_ID || '';
  const buildBoardId = process.env.TRELLO_BUILD_BOARD_ID || process.env.BUILD_BOARD_ID || '';
  return { apiKey, token, salesBoardId, buildBoardId };
}

export async function GET() {
  const { apiKey, token, salesBoardId, buildBoardId } = getEnv();
  const configured = !!(apiKey && token && (salesBoardId || buildBoardId));
  return NextResponse.json({ configured });
}
