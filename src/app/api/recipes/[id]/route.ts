import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { Recipe } from '@/lib/utils';

// 서버 사이드에서만 실행되는 함수
function getAllRecipesFromFile(): Recipe[] {
  try {
    // public 폴더에서 파일 읽기 시도
    const filePath = path.join(process.cwd(), 'public/data/processed_recipes.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('파일 읽기 오류:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipes = getAllRecipesFromFile();
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