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
 * 레시피 생성
 */
export async function createRecipe(recipe: any): Promise<RecipeRow | null> {
  try {
    // 1. 레시피 생성
    const { data: createdRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        id: recipe.id,
        title: recipe.title,
        short_title: recipe.shortTitle,
        register_id: recipe.registerId,
        register_name: recipe.registerName,
        view_count: recipe.viewCount,
        recommend_count: recipe.recommendCount,
        scrap_count: recipe.scrapCount,
        method: recipe.method,
        situation: recipe.situation,
        material_category: recipe.materialCategory,
        kind: recipe.kind,
        description: recipe.description,
        raw_ingredients: recipe.rawIngredients,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        time: recipe.time,
        first_register_date: recipe.firstRegisterDate,
        image_url: recipe.image_url
      })
      .select()
      .single();

    if (recipeError) {
      console.error('레시피 생성 오류:', recipeError);
      return null;
    }

    // 2. 재료 처리
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      // 2.1. 재료가 이미 존재하는지 확인하고, 없는 재료는 생성
      const ingredientNames = recipe.ingredients.map((name: string) => name.trim());
      
      // 2.2. 재료 조회
      const { data: existingIngredients, error: existingError } = await supabase
        .from('ingredients')
        .select('id, name')
        .in('name', ingredientNames);

      if (existingError) {
        console.error('재료 조회 오류:', existingError);
        return createdRecipe;
      }

      // 2.3. 없는 재료 생성
      const existingNames = new Set(existingIngredients.map(i => i.name));
      const newIngredients = ingredientNames.filter((name: string) => !existingNames.has(name));
      
      if (newIngredients.length > 0) {
        const { error: insertError } = await supabase
          .from('ingredients')
          .insert(newIngredients.map((name: string) => ({ name })));

        if (insertError) {
          console.error('재료 생성 오류:', insertError);
          return createdRecipe;
        }
      }

      // 2.4. 모든 재료 다시 조회
      const { data: allIngredients, error: allError } = await supabase
        .from('ingredients')
        .select('id, name')
        .in('name', ingredientNames);

      if (allError) {
        console.error('재료 목록 조회 오류:', allError);
        return createdRecipe;
      }

      // 2.5. 레시피-재료 관계 생성
      const recipeIngredients = allIngredients.map(ingredient => ({
        recipe_id: recipe.id,
        ingredient_id: ingredient.id
      }));

      const { error: relationError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients);

      if (relationError) {
        console.error('레시피-재료 연결 오류:', relationError);
      }
    }

    return createdRecipe;
  } catch (error) {
    console.error('레시피 생성 중 오류:', error);
    return null;
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
 * 기본 레시피 추천 함수 (재료 기반 매칭)
 */
export async function recommendRecipesByBasicMatching(ingredients: string[]): Promise<RecipeWithScore[]> {
  try {
    if (!ingredients || ingredients.length === 0) {
      return [];
    }
    
    // 재료 이름을 소문자로 변환하고 공백 제거
    const normalizedUserIngredients = ingredients.map(ing => 
      ing.toLowerCase().trim()
    );
    
    // 효율적인 쿼리를 위해 LIKE 검색을 위한 패턴 생성
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
      .limit(20);
    
    if (error) {
      console.error('추천 레시피 검색 오류:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
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
    return filteredRecipes.sort((a, b) => {
      // 먼저 일치하는 재료 수로 정렬
      if (b.score.matchCount !== a.score.matchCount) {
        return b.score.matchCount - a.score.matchCount;
      }
      // 일치하는 재료 수가 같으면 가중치 점수로 정렬
      return b.score.weightedScore - a.score.weightedScore;
    });
  } catch (error) {
    console.error('기본 레시피 추천 중 오류:', error);
    return [];
  }
}

/**
 * 재료 이름 배열을 기반으로 임베딩 벡터 조회
 */
export async function getIngredientsEmbeddings(ingredientNames: string[]): Promise<IngredientEmbedding[]> {
  try {
    // 재료 이름이 비어있으면 빈 배열 반환
    if (!ingredientNames || ingredientNames.length === 0) {
      console.log("재료 이름이 제공되지 않았습니다.");
      return [];
    }

    // 재료 이름을 소문자로 변환
    const normalizedNames = ingredientNames.map(name => name.trim().toLowerCase());

    // Supabase에서 재료 임베딩 조회
    const { data: ingredientEmbeddings, error } = await supabase
      .from('ingredients')
      .select('name, embedding')
      .or(normalizedNames.map(name => `name.ilike.${name}`).join(','));

    if (error) {
      console.error("임베딩 조회 오류:", error);
      return [];
    }

    if (!ingredientEmbeddings || ingredientEmbeddings.length === 0) {
      console.log("임베딩을 찾을 수 없습니다.");
      return [];
    }

    // 조회된 임베딩 처리 (문자열 임베딩을 배열로 변환)
    return ingredientEmbeddings.map(item => {
      let processedEmbedding = item.embedding;
      
      // 문자열 임베딩을 배열로 변환
      if (item.embedding && typeof item.embedding === 'string') {
        try {
          processedEmbedding = JSON.parse(item.embedding);
        } catch (e) {
          console.error(`"${item.name}" 임베딩 파싱 오류:`, e);
          processedEmbedding = null;
        }
      }
      
      return {
        name: item.name,
        embedding: Array.isArray(processedEmbedding) ? processedEmbedding : null
      };
    });
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
    console.log("임베딩 배열이 비어있습니다.");
    return null;
  }
  
  // 모든 벡터의 길이가 동일한지 확인
  const vectorLength = embeddings[0]?.length ?? 0;
  if (vectorLength === 0) {
    console.log("첫 번째 임베딩 벡터의 길이가 0입니다.");
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
 * 벡터 정규화 (길이가 1인 벡터로 변환)
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  // 벡터의 크기(magnitude) 계산
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  // 0으로 나누기 방지
  if (magnitude === 0) {
    console.log("임베딩 벡터의 크기가 0입니다.");
    return embedding;
  }
  
  // 각 요소를 크기로 나누어 정규화
  return embedding.map(val => val / magnitude);
}

/**
 * 임베딩 벡터로 유사한 레시피 조회
 */
export async function findSimilarRecipes(
  embedding: number[], 
  threshold: number = 0.01, 
  limit: number = 15
): Promise<MatchRecipeResult[]> {
  try {
    // RPC 함수 호출
    const { data, error } = await supabase.rpc('match_recipes', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error("레시피 매칭 오류:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("레시피 검색 중 오류:", error);
    return [];
  }
}

/**
 * 재료 이름으로 레시피 추천 - 전체 프로세스
 */
export async function recommendRecipesByIngredients(
  ingredientNames: string[]
): Promise<MatchRecipeResult[]> {
  try {
    // 1. 재료 임베딩 조회
    const ingredientEmbeddings = await getIngredientsEmbeddings(ingredientNames);
    
    // 유효한 임베딩만 필터링
    const validEmbeddings = ingredientEmbeddings
      .filter(item => item.embedding !== null)
      .map(item => item.embedding as number[]);
    
    if (validEmbeddings.length === 0) {
      console.log("유효한 임베딩이 없습니다.");
      return [];
    }
    
    // 2. 평균 임베딩 계산
    const averageEmbedding = calculateAverageEmbedding(validEmbeddings);
    if (!averageEmbedding) {
      console.log("평균 임베딩 계산 실패");
      return [];
    }
    
    // 3. 임베딩 정규화
    const normalizedEmbedding = normalizeEmbedding(averageEmbedding);
    
    // 4. 유사 레시피 조회
    return await findSimilarRecipes(normalizedEmbedding);
  } catch (error) {
    console.error("레시피 추천 중 오류:", error);
    return [];
  }
} 