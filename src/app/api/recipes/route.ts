import { NextResponse } from 'next/server';

import { getAllRecipesFromFile } from '@/lib/server';

export async function GET() {
  try {
    const recipes = await getAllRecipesFromFile();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('레시피 목록을 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '레시피 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 