import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import { Recipe } from '@/lib/utils';

// 서버 사이드에서만 실행되는 함수
function getAllRecipesFromFile(): Recipe[] {
  const filePath = path.join(process.cwd(), 'src/data/processed_recipes.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const recipes = JSON.parse(fileContents);
  return recipes;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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