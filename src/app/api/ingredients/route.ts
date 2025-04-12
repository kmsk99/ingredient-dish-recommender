import { NextResponse } from 'next/server';

import { getAllIngredients } from '@/lib/utils';

export async function GET() {
  try {
    const ingredientsWithCount = await getAllIngredients();
    return NextResponse.json(ingredientsWithCount);
  } catch (error) {
    console.error('재료 목록을 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '재료 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 