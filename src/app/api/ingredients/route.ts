import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { IngredientWithCount, Recipe } from '@/lib/utils';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 재료 조회 쿼리 구성
    let query = supabase
      .from('ingredients')
      .select(`
        id,
        name,
        recipe_ingredients!inner (
          recipe_id
        )
      `);

    // 검색어가 있으면 필터링 적용
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // 페이지네이션 적용
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('재료 목록 조회 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 재료별 레시피 개수 계산
    const ingredientsWithCount: IngredientWithCount[] = data.map(ingredient => ({
      name: ingredient.name,
      count: ingredient.recipe_ingredients.length
    })).sort((a, b) => b.count - a.count); // 사용 빈도 순 정렬

    return NextResponse.json(ingredientsWithCount);
  } catch (error: any) {
    console.error('재료 API 오류:', error);
    return NextResponse.json(
      { error: error.message || '재료 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ingredient = await request.json();
    
    // 1. 재료 생성
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        name: ingredient.name
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 