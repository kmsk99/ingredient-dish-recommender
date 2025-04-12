import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { Recipe } from '@/lib/utils';

// 서버 사이드에서만 실행되는 함수
function getAllRecipesFromFile(): Recipe[] {
  const filePath = path.join(process.cwd(), 'src/data/processed_recipes.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const recipes = JSON.parse(fileContents);
  return recipes;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredientsParam = searchParams.get('ingredients') || '';
    
    if (!ingredientsParam) {
      return NextResponse.json([]);
    }
    
    const userIngredients = ingredientsParam
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    const recipes = getAllRecipesFromFile();
    
    // 재료 이름을 소문자로 변환하고 공백 제거
    const normalizedUserIngredients = userIngredients.map(ing => 
      ing.toLowerCase().trim()
    );
    
    // 각 레시피에 대해 사용자 재료가 얼마나 포함되는지 계산
    const recipesWithScore = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => 
        ing.toLowerCase().trim()
      );
      
      // 사용자 재료 중 레시피에 포함된 재료 수
      const matchingIngredients = normalizedUserIngredients.filter(userIng => 
        recipeIngredients.some(recipeIng => recipeIng.includes(userIng))
      );
      
      const matchCount = matchingIngredients.length;
      const recipeIngredientCoverage = recipeIngredients.length > 0 
        ? matchingIngredients.length / recipeIngredients.length 
        : 0;
      
      const score = {
        matchCount,
        matchRatio: matchCount / normalizedUserIngredients.length,
        recipeIngredientCoverage: Math.round(recipeIngredientCoverage * 100) / 100,
        // 가중치를 주어 정렬 (일치하는 재료가 많을수록, 레시피 재료가 적을수록 상위에 표시)
        weightedScore: matchCount / recipeIngredients.length
      };
      
      return { ...recipe, score };
    });
    
    // 매칭되는 재료가 하나도 없는 레시피는 제외
    const filteredRecipes = recipesWithScore.filter(recipe => recipe.score.matchCount > 0);
    
    // 가중치 점수로 정렬
    const sortedRecipes = filteredRecipes.sort((a, b) => {
      // 먼저 일치하는 재료 수로 정렬
      if (b.score.matchCount !== a.score.matchCount) {
        return b.score.matchCount - a.score.matchCount;
      }
      // 일치하는 재료 수가 같으면 가중치 점수로 정렬
      return b.score.weightedScore - a.score.weightedScore;
    });
    
    return NextResponse.json(sortedRecipes);
  } catch (error) {
    console.error('추천 레시피를 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '추천 레시피를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 