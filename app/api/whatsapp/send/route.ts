import { NextResponse } from 'next/server';
import { retryWhatsAppMessage } from '@/lib/data/store';

export async function POST(req: Request) {
  try {
    const { messageId } = await req.json();
    const result = await retryWhatsAppMessage(messageId);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
