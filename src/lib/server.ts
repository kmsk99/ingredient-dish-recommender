import fs from 'fs';
import path from 'path';

import { Recipe } from './utils';

// 파일에서 모든 레시피 데이터 가져오기 - 서버 사이드에서 실행
export async function getAllRecipesFromFile(): Promise<Recipe[]> {
  try {    
    // public 폴더에서 파일 읽기
    const filePath = path.join(process.cwd(), 'public/data/processed_recipes.json');
    console.log(`getAllRecipesFromFile: 파일 경로 - ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`getAllRecipesFromFile: 파일이 존재하지 않음 - ${filePath}`);
      return [];
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    console.log(`getAllRecipesFromFile: 파일 읽기 성공, 크기 - ${fileContents.length} 바이트`);
    
    const recipes = JSON.parse(fileContents);
    console.log(`getAllRecipesFromFile: JSON 파싱 성공, 레시피 수 - ${recipes.length}`);
    
    return recipes;
  } catch (error) {
    console.error('getAllRecipesFromFile: 파일 읽기 오류:', error);
    return [];
  }
} 