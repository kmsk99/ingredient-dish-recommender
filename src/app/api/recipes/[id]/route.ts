import { NextRequest, NextResponse } from 'next/server';

import { getAllRecipesFromFile } from '@/lib/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipes = await getAllRecipesFromFile();
    const recipe = recipes.find(recipe => recipe.id === id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: '해당 레시피를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('레시피를 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '레시피를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 