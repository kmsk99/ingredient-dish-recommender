import { NextResponse } from 'next/server';

import { Recipe } from '@/lib/utils';

// 서버 사이드에서만 실행되는 함수
async function getAllRecipesFromFile(): Promise<Recipe[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/data/processed_recipes.json`);
  const recipes = await response.json();
  return recipes;
}

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