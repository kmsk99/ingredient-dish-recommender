import { Database } from '@/supabase/types/database.types';

import { supabase } from './supabase';

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  ingredients: string[];
};

type IngredientWithCount = {
  name: string;
  count: number;
};

interface GetRecipesOptions {
  limit?: number;
  offset?: number;
  materialCategory?: string;
  kind?: string;
  searchTerm?: string;
}

interface GetIngredientsOptions {
  limit?: number;
  offset?: number;
  searchTerm?: string;
}

// Supabase에서 레시피 데이터 가져오기 (페이지네이션 및 필터링 지원)
export async function getAllRecipesFromDB(options: GetRecipesOptions = {}): Promise<Recipe[]> {
  try {
    const {
      limit = 20,
      offset = 0,
      materialCategory,
      kind,
      searchTerm
    } = options;

    let query = supabase
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터링 적용
    if (materialCategory) {
      query = query.eq('material_category', materialCategory);
    }

    if (kind) {
      query = query.eq('kind', kind);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,short_title.ilike.%${searchTerm}%,raw_ingredients.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getAllRecipesFromDB: 데이터베이스 조회 오류:', error);
      return [];
    }

    // 데이터 구조 변환
    const transformedData = data.map(recipe => ({
      ...recipe,
      ingredients: recipe.recipe_ingredients.map((ri: { ingredient: { name: string } }) => ri.ingredient.name)
    }));

    return transformedData;
  } catch (error) {
    console.error('getAllRecipesFromDB: 오류 발생:', error);
    return [];
  }
}

// Supabase에서 재료 데이터 가져오기 (페이지네이션 및 필터링 지원)
export async function getAllIngredientsFromDB(options: GetIngredientsOptions = {}): Promise<IngredientWithCount[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      searchTerm
    } = options;

    let query = supabase
      .from('ingredients')
      .select(`
        *,
        recipe_ingredients!inner (
          recipe:recipes (
            id
          )
        )
      `);

    // 검색어 필터링 적용
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('getAllIngredientsFromDB: 데이터베이스 조회 오류:', error);
      return [];
    }

    // 데이터 구조 변환
    const ingredientsWithCount = data.map(ingredient => ({
      name: ingredient.name,
      count: ingredient.recipe_ingredients.length
    }));

    // 사용 횟수가 많은 순으로 정렬
    return ingredientsWithCount.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('getAllIngredientsFromDB: 오류 발생:', error);
    return [];
  }
}

// 기존 파일 기반 함수는 더 이상 사용하지 않음
export async function getAllRecipesFromFile(): Promise<Recipe[]> {
  console.warn('getAllRecipesFromFile: 이 함수는 더 이상 사용되지 않습니다. getAllRecipesFromDB를 사용하세요.');
  return [];
}

export function getAllIngredientsFromRecipes(): IngredientWithCount[] {
  console.warn('getAllIngredientsFromRecipes: 이 함수는 더 이상 사용되지 않습니다. getAllIngredientsFromDB를 사용하세요.');
  return [];
} 