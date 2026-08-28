import { NextResponse } from 'next/server';
import { validateDiscountCode } from '@/lib/data/store';

export async function POST(req: Request) {
  try {
    const { code, subtotal, businessId } = await req.json();
    const result = await validateDiscountCode(code, subtotal, businessId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: err.message },
      { status: 400 }
    );
  }
}
