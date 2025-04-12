import fs from 'fs';
import path from 'path';

import { Recipe } from './utils';

// 파일에서 모든 레시피 데이터 가져오기 - 서버 사이드에서 실행
export async function getAllRecipesFromFile(): Promise<Recipe[]> {
  try {    
    // public 폴더에서 파일 읽기
    const filePath = path.join(process.cwd(), 'public/data/processed_recipes.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('파일 읽기 오류:', error);
    return [];
  }
} 