import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/data/store';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, triggerWhatsApp = true } = body;

    const order = await updateOrderStatus(id, status, triggerWhatsApp);
    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
