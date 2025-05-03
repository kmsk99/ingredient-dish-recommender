import { supabase } from './supabase';
import { IngredientWithCount, Recipe } from './types';

/**
 * 재료 검색
 */
export async function searchIngredients(options: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<IngredientWithCount[]> {
  try {
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const search = options.search || '';

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
      return [];
    }

    // 재료별 레시피 개수 계산
    return data.map(ingredient => ({
      name: ingredient.name,
      count: ingredient.recipe_ingredients.length
    })).sort((a, b) => b.count - a.count); // 사용 빈도 순 정렬
  } catch (error) {
    console.error('재료 검색 중 오류:', error);
    return [];
  }
}

/**
 * 새 재료 생성
 */
export async function createIngredient(name: string): Promise<{ id: string; name: string } | null> {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        name: name.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('재료 생성 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('재료 생성 중 오류:', error);
    return null;
  }
}

/**
 * 모든 레시피에서 재료 목록 추출 (서버 함수 대체용)
 */
export async function getAllIngredientsFromRecipes(recipes: Recipe[]): Promise<IngredientWithCount[]> {
  // 모든 레시피에서 재료를 추출하고 카운트
  const ingredientCounts = new Map<string, number>();
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach((ingredient: string) => {
      const trimmedIngredient = ingredient.trim();
      const currentCount = ingredientCounts.get(trimmedIngredient) || 0;
      ingredientCounts.set(trimmedIngredient, currentCount + 1);
    });
  });
  
  // 이름과 카운트를 객체 배열로 변환
  return Array.from(ingredientCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 사용 횟수가 많은 순으로 정렬
} 