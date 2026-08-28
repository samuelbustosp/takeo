import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/data/store';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const order = await createOrder(payload);
    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
