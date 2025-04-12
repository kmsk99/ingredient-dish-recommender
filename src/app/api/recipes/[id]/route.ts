import { NextRequest, NextResponse } from 'next/server';

import { getAllRecipesFromFile } from '@/lib/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`API 라우트: 레시피 ID ${id} 조회 시작`);
    
    const recipes = await getAllRecipesFromFile();
    console.log(`API 라우트: 총 ${recipes.length}개의 레시피 로드됨`);
    
    const recipe = recipes.find(recipe => recipe.id === id);
    console.log(`API 라우트: 레시피 ID ${id} 검색 결과:`, recipe ? '찾음' : '찾지 못함');
    
    if (!recipe) {
      console.log(`API 라우트: 레시피 ID ${id}를 찾을 수 없음, 404 응답 반환`);
      return NextResponse.json(
        { error: '해당 레시피를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    console.log(`API 라우트: 레시피 ID ${id} 응답 성공`);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('API 라우트: 레시피를 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '레시피를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 