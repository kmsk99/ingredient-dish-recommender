import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import { IngredientWithCount, Recipe } from '@/lib/utils';

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

// 서버 사이드에서만 실행되는 함수
function getAllIngredientsFromRecipes(recipes: Recipe[]): IngredientWithCount[] {
  // 모든 레시피에서 재료를 추출하고 카운트
  const ingredientCounts = new Map<string, number>();
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const trimmedIngredient = ingredient.trim();
      const currentCount = ingredientCounts.get(trimmedIngredient) || 0;
      ingredientCounts.set(trimmedIngredient, currentCount + 1);
    });
  });
  
  // 이름과 카운트를 객체 배열로 변환
  const ingredientsWithCount: IngredientWithCount[] = Array.from(ingredientCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 사용 횟수가 많은 순으로 정렬
  
  return ingredientsWithCount;
}

export async function GET() {
  try {
    const recipes = await getAllRecipesFromFile();
    const ingredientsWithCount = getAllIngredientsFromRecipes(recipes);
    return NextResponse.json(ingredientsWithCount);
  } catch (error) {
    console.error('재료 목록을 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '재료 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 