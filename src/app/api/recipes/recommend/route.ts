import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredientsParam = searchParams.get('ingredients') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!ingredientsParam) {
      return NextResponse.json([]);
    }
    
    const userIngredients = ingredientsParam
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    if (userIngredients.length === 0) {
      return NextResponse.json([]);
    }
    
    // 재료 이름을 소문자로 변환하고 공백 제거
    const normalizedUserIngredients = userIngredients.map(ing => 
      ing.toLowerCase().trim()
    );
    
    // 효율적인 쿼리를 위해 LIKE 검색을 위한 패턴 생성
    // 각 재료를 포함하는 레시피를 필터링하기 위한 쿼리 조건 구성
    const ingredientPatterns = normalizedUserIngredients.map(ing => 
      `raw_ingredients.ilike.%${ing.replace(/%/g, '\\%')}%`
    );
    
    // 쿼리 실행
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients!inner (
          ingredient:ingredients (
            id,
            name
          )
        )
      `)
      .or(ingredientPatterns.join(','))
      .limit(limit);
    
    if (error) {
      console.error('추천 레시피 검색 오류:', error);
      return NextResponse.json(
        { error: '레시피를 검색하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }
    
    // 데이터 구조 변환 및 스코어 계산
    const recipesWithScore = data.map(recipe => {
      const recipeIngredients = recipe.recipe_ingredients.map(
        (ri: { ingredient: { name: string } }) => ri.ingredient.name.toLowerCase().trim()
      );
      
      // 사용자 재료 중 레시피에 포함된 재료 수
      const matchingIngredients = normalizedUserIngredients.filter(userIng => 
        recipeIngredients.some((recipeIng: string) => recipeIng.includes(userIng))
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
        weightedScore: matchCount / Math.max(1, recipeIngredients.length)
      };
      
      return { 
        ...recipe, 
        ingredients: recipeIngredients,
        score
      };
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