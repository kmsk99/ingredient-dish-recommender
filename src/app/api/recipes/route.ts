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

export async function GET() {
  try {
    const recipes = getAllRecipesFromFile();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('레시피 목록을 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '레시피 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 