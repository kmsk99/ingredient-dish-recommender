import { RecipeIngredient } from './recipe-types';
import { supabase } from './supabase';
import { RecipeRow, RecipeWithScore } from './types';

/**
 * 레시피 목록 조회
 */
export async function getRecipes(options: {
  materialCategory?: string;
  kind?: string;
  limit?: number;
  offset?: number;
}): Promise<RecipeRow[]> {
  try {
    const limit = options.limit || 10;
    const offset = options.offset || 0;

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
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (options.materialCategory) {
      query = query.eq('material_category', options.materialCategory);
    }

    if (options.kind) {
      query = query.eq('kind', options.kind);
    }

    const { data, error } = await query;

    if (error) {
      console.error('레시피 목록 조회 오류:', error);
      return [];
    }

    // 데이터 구조 변환
    return data.map(recipe => ({
      ...recipe,
      ingredients: recipe.recipe_ingredients.map((ri: RecipeIngredient) => ri.ingredient.name)
    }));
  } catch (error) {
    console.error('레시피 목록 조회 중 오류:', error);
    return [];
  }
}

/**
 * ID로 레시피 상세 정보 가져오기
 */
export async function getRecipeById(id: string): Promise<RecipeRow | null> {
  try {
    // ID로 직접 레시피 조회
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
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('레시피 조회 오류:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // 데이터 구조 변환
    return {
      ...data,
      ingredients: data.recipe_ingredients.map((ri: { ingredient: { name: string } }) => ri.ingredient.name)
    };
  } catch (error) {
    console.error('레시피 상세 조회 중 오류:', error);
    return null;
  }
}

/**
 * 향상된 레시피 추천 함수 (정확한 재료 매칭 기반)
 */
export async function recommendRecipesByBasicMatching(ingredients: string[]): Promise<RecipeWithScore[]> {
  try {
    if (!ingredients || ingredients.length === 0) {
      return [];
    }
    
    console.log(`[추천 시스템] 검색 재료: ${ingredients.join(', ')}`);
    
    // 재료 이름을 정규화
    const normalizedUserIngredients = ingredients.map(ing => 
      ing.toLowerCase().trim().replace(/\s+/g, '')
    );
    
    // 1단계: 실제 재료 테이블에서 일치하는 재료 찾기
    const { data: matchingIngredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('id, name')
      .or(normalizedUserIngredients.map(ing => 
        `name.ilike.%${ing}%`
      ).join(','));
    
    if (ingredientError) {
      console.error('재료 검색 오류:', ingredientError);
      return [];
    }
    
    if (!matchingIngredients || matchingIngredients.length === 0) {
      console.log('[추천 시스템] 일치하는 재료가 없습니다.');
      return [];
    }
    
    console.log(`[추천 시스템] 발견된 재료: ${matchingIngredients.map(i => i.name).join(', ')}`);
    
    const matchingIngredientIds = matchingIngredients.map(ing => ing.id);
    
    // 2단계: 해당 재료를 포함하는 레시피 검색
    const { data: recipeIds, error: recipeIdError } = await supabase
      .from('recipe_ingredients')
      .select('recipe_id, ingredient_id')
      .in('ingredient_id', matchingIngredientIds);
    
    if (recipeIdError) {
      console.error('레시피-재료 매핑 조회 오류:', recipeIdError);
      return [];
    }
    
    if (!recipeIds || recipeIds.length === 0) {
      console.log('[추천 시스템] 해당 재료를 사용하는 레시피가 없습니다.');
      return [];
    }
    
    // 레시피별 매칭된 재료 수 계산
    const recipeIngredientCounts = new Map<string, Set<string>>();
    recipeIds.forEach(({ recipe_id, ingredient_id }) => {
      if (!recipeIngredientCounts.has(recipe_id)) {
        recipeIngredientCounts.set(recipe_id, new Set());
      }
      recipeIngredientCounts.get(recipe_id)!.add(ingredient_id);
    });
    
    // 적어도 1개 이상의 재료가 매칭되는 레시피만 선별
    const uniqueRecipeIds = Array.from(recipeIngredientCounts.keys());
    
    console.log(`[추천 시스템] 후보 레시피 수: ${uniqueRecipeIds.length}`);
    
    // 3단계: 레시피 상세 정보 조회
    const { data: recipes, error: recipeError } = await supabase
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
      .in('id', uniqueRecipeIds)
      .limit(120); // 더 많은 결과 조회 (120개로 증가)

    if (recipeError) {
      console.error('레시피 상세 조회 오류:', recipeError);
      return [];
    }
    
    if (!recipes || recipes.length === 0) {
      return [];
    }
    
    // 4단계: 점수 계산 및 정렬
    const recipesWithScore = recipes.map(recipe => {
      const recipeIngredients = recipe.recipe_ingredients.map(
        (ri: { ingredient: { name: string, id: string } }) => ({
          id: ri.ingredient.id,
          name: ri.ingredient.name.toLowerCase().trim()
        })
      );
      
      // 사용자 재료와 매칭되는 레시피 재료 찾기
      const matchingRecipeIngredients = recipeIngredients.filter((recipeIng: { id: string; name: string }) => 
        normalizedUserIngredients.some(userIng => {
          const normalizedRecipeIng = recipeIng.name.replace(/\s+/g, '');
          return normalizedRecipeIng.includes(userIng) || userIng.includes(normalizedRecipeIng);
        })
      );
      
      const matchCount = matchingRecipeIngredients.length;
      const totalRecipeIngredients = recipeIngredients.length;
      const totalUserIngredients = normalizedUserIngredients.length;
      
      // 매칭 비율 계산
      const userIngredientCoverage = matchCount / totalUserIngredients; // 사용자 재료 중 얼마나 사용되었는가
      const recipeIngredientCoverage = matchCount / totalRecipeIngredients; // 레시피 재료 중 얼마나 보유하고 있는가
      const matchRatio = matchCount / Math.max(totalUserIngredients, totalRecipeIngredients); // 전체 대비 매칭 비율
      
      // 가중 점수 계산 (0-1 범위로 정규화)
      const weightedScore = (
        matchRatio * 0.4 + // 매칭 비율 (40%)
        userIngredientCoverage * 0.35 + // 사용자 재료 활용도 (35%)
        recipeIngredientCoverage * 0.25 // 레시피 완성도 (25%)
      ); // 합계가 1이 되도록 가중치 조정
      
      return { 
        ...recipe, 
        ingredients: recipeIngredients.map((ri: { id: string; name: string }) => ri.name),
        score: {
          matchCount,
          matchRatio,
          recipeIngredientCoverage,
          weightedScore
        }
      };
    });
    
    // 매칭되는 재료가 없는 레시피 제거
    const filteredRecipes = recipesWithScore.filter(recipe => recipe.score.matchCount > 0);
    
    console.log(`[추천 시스템] 필터링 후 레시피 수: ${filteredRecipes.length}`);
    
    // 가중치 점수로 정렬 (높은 점수 우선)
    const sortedRecipes = filteredRecipes.sort((a, b) => {
      // 1차: 매칭된 재료 수
      if (b.score.matchCount !== a.score.matchCount) {
        return b.score.matchCount - a.score.matchCount;
      }
      // 2차: 가중치 점수
      return b.score.weightedScore - a.score.weightedScore;
    });
    
    // 상위 20개 반환 (정제된 결과)
    return sortedRecipes.slice(0, 20);
  } catch (error) {
    console.error('기본 레시피 추천 중 오류:', error);
    return [];
  }
}

/**
 * 레시피에 대한 기본 매칭 점수 계산
 */
export async function calculateBasicScoreForRecipe(recipeId: string, userIngredients: string[]): Promise<number> {
  try {
    const { data: recipe, error } = await supabase
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
      .eq('id', recipeId)
      .single();

    if (error || !recipe) {
      return 0;
    }

    const normalizedUserIngredients = userIngredients.map(ing => 
      ing.toLowerCase().trim().replace(/\s+/g, '')
    );

    const recipeIngredients = recipe.recipe_ingredients.map(
      (ri: { ingredient: { name: string, id: string } }) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name.toLowerCase().trim()
      })
    );

    // 매칭되는 재료 찾기
    const matchingRecipeIngredients = recipeIngredients.filter((recipeIng: { id: string; name: string }) => 
      normalizedUserIngredients.some(userIng => {
        const normalizedRecipeIng = recipeIng.name.replace(/\s+/g, '');
        return normalizedRecipeIng.includes(userIng) || userIng.includes(normalizedRecipeIng);
      })
    );

    const matchCount = matchingRecipeIngredients.length;
    const totalRecipeIngredients = recipeIngredients.length;
    const totalUserIngredients = normalizedUserIngredients.length;

    if (matchCount === 0) return 0;

    // 매칭 비율 계산
    const userIngredientCoverage = matchCount / totalUserIngredients;
    const recipeIngredientCoverage = matchCount / totalRecipeIngredients;
    const matchRatio = matchCount / Math.max(totalUserIngredients, totalRecipeIngredients);

    // 가중 점수 계산
    const weightedScore = (
      matchRatio * 0.4 +
      userIngredientCoverage * 0.35 +
      recipeIngredientCoverage * 0.25
    );

    return weightedScore;
  } catch (error) {
    console.error(`레시피 ${recipeId} 기본 점수 계산 오류:`, error);
    return 0;
  }
} 