import fs from 'fs';
import { NextResponse } from 'next/server';
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