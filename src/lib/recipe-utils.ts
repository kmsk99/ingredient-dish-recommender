import { supabase } from './supabase';

/**
 * 인터페이스 정의
 */
interface IngredientEmbedding {
  name: string;
  embedding: number[] | null;
}

interface RecommendedRecipe {
  id: string;
  title: string;
  short_title?: string;
  raw_ingredients?: string;
  image_url?: string;
  similarity: number;
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
): Promise<RecommendedRecipe[]> {
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
): Promise<RecommendedRecipe[]> {
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