import { supabase } from './supabase';
import { MatchRecipeResult, RecipeRow, RecipeWithScore } from './types';

/**
 * 인터페이스 정의
 */
interface RecipeIngredient {
  ingredient: {
    id: string;
    name: string;
  };
}

interface IngredientEmbedding {
  name: string;
  embedding: number[] | null;
}

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
      .limit(50); // 너무 많은 결과 방지
    
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
      
      // 가중 점수 계산 (매칭 개수 + 커버리지 고려)
      const weightedScore = (
        matchCount * 2 + // 매칭 개수에 높은 가중치
        userIngredientCoverage * 1.5 + // 사용자 재료 활용도
        recipeIngredientCoverage * 1.0 // 레시피 완성도
      ) / (2 + 1.5 + 1.0); // 정규화
      
      return { 
        ...recipe, 
        ingredients: recipeIngredients.map((ri: { id: string; name: string }) => ri.name),
        score: {
          matchCount,
          matchRatio: userIngredientCoverage,
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
    
    // 상위 20개만 반환
    return sortedRecipes.slice(0, 20);
  } catch (error) {
    console.error('기본 레시피 추천 중 오류:', error);
    return [];
  }
}

/**
 * 재료 임베딩 조회
 */
export async function getIngredientsEmbeddings(ingredientNames: string[]): Promise<IngredientEmbedding[]> {
  try {
    if (!ingredientNames || ingredientNames.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('ingredients')
      .select('name, embedding')
      .in('name', ingredientNames);

    if (error) {
      console.error("재료 임베딩 조회 오류:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("재료 임베딩 조회 중 오류:", error);
    return [];
  }
}

/**
 * 평균 임베딩 벡터 계산
 */
export function calculateAverageEmbedding(embeddings: number[][]): number[] | null {
  if (!embeddings || embeddings.length === 0) {
    return null;
  }
  
  const vectorLength = embeddings[0]?.length ?? 0;
  if (vectorLength === 0) {
    return null;
  }

  // 길이가 다른 벡터가 있는지 확인
  const allSameLength = embeddings.every(emb => emb.length === vectorLength);
  if (!allSameLength) {
    console.error("임베딩 벡터 길이가 일치하지 않습니다.");
    return null;
  }

  // 평균 벡터 계산
  const avgEmbedding = new Array(vectorLength).fill(0);
  for (const embedding of embeddings) {
    for (let i = 0; i < vectorLength; i++) {
      avgEmbedding[i] += embedding[i];
    }
  }

  // 평균 계산
  for (let i = 0; i < vectorLength; i++) {
    avgEmbedding[i] /= embeddings.length;
  }
  
  return avgEmbedding;
}

/**
 * 벡터 정규화
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  if (magnitude === 0) {
    return embedding;
  }
  
  return embedding.map(val => val / magnitude);
}

/**
 * 임베딩 벡터로 유사한 레시피 조회 (개선된 버전)
 */
export async function findSimilarRecipes(
  embedding: number[], 
  threshold: number = 0.6,
  limit: number = 20
): Promise<MatchRecipeResult[]> {
  try {
    let currentThreshold = threshold;
    let results: MatchRecipeResult[] = [];
    
    // threshold를 단계적으로 낮춰가며 최소 5개 이상의 결과 확보
    while (currentThreshold >= 0.3 && results.length < 5) {
      const { data, error } = await supabase.rpc('match_recipes', {
        query_embedding: embedding,
        match_threshold: currentThreshold,
        match_count: limit
      });

      if (error) {
        console.error(`레시피 매칭 오류 (threshold: ${currentThreshold}):`, error);
        break;
      }
      
      results = data || [];
      if (results.length < 5 && currentThreshold > 0.3) {
        currentThreshold -= 0.1;
      } else {
        break;
      }
    }

    console.log(`[임베딩 추천] 최종 threshold: ${currentThreshold}, 결과: ${results.length}개`);
    return results;
  } catch (error) {
    console.error("레시피 검색 중 오류:", error);
    return [];
  }
}

/**
 * 재료 이름으로 레시피 추천 - 임베딩 + 기본 매칭 하이브리드
 */
export async function recommendRecipesByIngredients(
  ingredientNames: string[]
): Promise<MatchRecipeResult[]> {
  try {
    console.log(`[하이브리드 추천] 시작: ${ingredientNames.join(', ')}`);
    
    // 1차: 임베딩 기반 추천 시도
    try {
      const ingredientEmbeddings = await getIngredientsEmbeddings(ingredientNames);
      
      const validEmbeddings = ingredientEmbeddings
        .filter(item => item.embedding !== null)
        .map(item => item.embedding as number[]);
      
      if (validEmbeddings.length > 0) {
        const averageEmbedding = calculateAverageEmbedding(validEmbeddings);
        
        if (averageEmbedding) {
          const normalizedEmbedding = normalizeEmbedding(averageEmbedding);
          const embeddingResults = await findSimilarRecipes(normalizedEmbedding, 0.6, 15);
          
          if (embeddingResults && embeddingResults.length >= 5) {
            console.log(`[하이브리드 추천] 임베딩 성공: ${embeddingResults.length}개`);
            return embeddingResults;
          }
        }
      }
    } catch {
      console.log("[하이브리드 추천] 임베딩 추천 실패, 기본 매칭으로 전환");
    }
    
    // 2차: 기본 매칭 방식 사용
    console.log("[하이브리드 추천] 기본 매칭 사용");
    const basicResults = await recommendRecipesByBasicMatching(ingredientNames);
    
    // 결과 형식 변환
    return basicResults.map(item => ({
      id: item.id,
      title: item.title,
      short_title: item.short_title || '',
      raw_ingredients: item.raw_ingredients || '',
      image_url: item.image_url || '',
      similarity: item.score.weightedScore
    }));
    
  } catch (error) {
    console.error("레시피 추천 중 오류:", error);
    return [];
  }
} 