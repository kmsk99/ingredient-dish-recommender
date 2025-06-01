import { IngredientEmbedding } from './recipe-types';
import { supabase } from './supabase';
import { MatchRecipeResult } from './types';

/**
 * 재료 임베딩 조회 (개선된 버전 - 원래 로직 유지)
 */
export async function getIngredientsEmbeddings(ingredientNames: string[]): Promise<IngredientEmbedding[]> {
  try {
    if (!ingredientNames || ingredientNames.length === 0) {
      console.log("재료 이름이 제공되지 않았습니다.");
      return [];
    }

    console.log(`[임베딩 조회] 요청된 재료: ${ingredientNames.join(', ')}`);

    // 재료 이름을 소문자로 변환
    const normalizedNames = ingredientNames.map(name => name.trim().toLowerCase());

    // Supabase에서 재료 임베딩 조회 (원래 쿼리 방식 사용)
    const { data: ingredientEmbeddings, error } = await supabase
      .from('ingredients')
      .select('name, embedding')
      .or(normalizedNames.map(name => `name.ilike.${name}`).join(','));

    if (error) {
      console.error("임베딩 조회 오류:", error);
      return [];
    }

    if (!ingredientEmbeddings || ingredientEmbeddings.length === 0) {
      console.warn(`[임베딩 조회] 임베딩 데이터를 찾을 수 없습니다: ${ingredientNames.join(', ')}`);
      return [];
    }

    // 조회된 임베딩 처리 (문자열 임베딩을 배열로 변환)
    const processedData: IngredientEmbedding[] = [];
    const problematicIngredients: string[] = [];

    for (const item of ingredientEmbeddings) {
      let processedEmbedding = item.embedding;
      
      // 문자열 임베딩을 배열로 변환 (원래 로직)
      if (item.embedding && typeof item.embedding === 'string') {
        try {
          processedEmbedding = JSON.parse(item.embedding);
        } catch (e) {
          console.error(`"${item.name}" 임베딩 파싱 오류:`, e);
          problematicIngredients.push(`${item.name} (JSON parse error)`);
          processedEmbedding = null;
        }
      }

      // 파싱 후 품질 검사
      if (!processedEmbedding) {
        problematicIngredients.push(`${item.name} (null embedding)`);
        continue;
      }

      // 임베딩이 배열인지 확인
      if (!Array.isArray(processedEmbedding)) {
        problematicIngredients.push(`${item.name} (not array after parsing: ${typeof processedEmbedding})`);
        continue;
      }

      // 임베딩 배열이 유효한지 확인
      if (processedEmbedding.length === 0) {
        problematicIngredients.push(`${item.name} (empty array)`);
        continue;
      }

      // 모든 값이 숫자인지 확인
      const hasInvalidValues = processedEmbedding.some(val => typeof val !== 'number' || isNaN(val));
      if (hasInvalidValues) {
        problematicIngredients.push(`${item.name} (invalid values)`);
        continue;
      }

      processedData.push({
        name: item.name,
        embedding: processedEmbedding
      });
    }

    // 문제가 있는 재료들 로그 출력
    if (problematicIngredients.length > 0) {
      console.warn(`[임베딩 조회] 문제가 있는 재료들: ${problematicIngredients.join(', ')}`);
    }

    console.log(`[임베딩 조회] 성공: ${processedData.length}/${ingredientEmbeddings.length}개 임베딩 획득`);
    
    // 임베딩 길이 통계 출력
    if (processedData.length > 0) {
      const lengths = processedData.map(item => item.embedding?.length || 0);
      const uniqueLengths = Array.from(new Set(lengths));
      if (uniqueLengths.length > 1) {
        console.warn(`[임베딩 조회] 다양한 임베딩 길이 발견: ${uniqueLengths.join(', ')}`);
      } else {
        console.log(`[임베딩 조회] 일관된 임베딩 길이: ${uniqueLengths[0]}`);
      }
    }

    return processedData;
  } catch (error) {
    console.error("재료 임베딩 조회 중 오류:", error);
    return [];
  }
}

/**
 * 평균 임베딩 벡터 계산 (안전한 버전)
 */
export function calculateAverageEmbedding(embeddings: number[][]): number[] | null {
  if (!embeddings || embeddings.length === 0) {
    return null;
  }
  
  // 유효한 임베딩들만 필터링 (null이 아니고 배열인 것들)
  const validEmbeddings = embeddings.filter(emb => 
    Array.isArray(emb) && emb.length > 0 && emb.every(val => typeof val === 'number' && !isNaN(val))
  );
  
  if (validEmbeddings.length === 0) {
    console.warn("[임베딩 계산] 유효한 임베딩 벡터가 없습니다.");
    return null;
  }
  
  // 가장 일반적인 벡터 길이를 찾기
  const lengthCounts = new Map<number, number>();
  validEmbeddings.forEach(emb => {
    const length = emb.length;
    lengthCounts.set(length, (lengthCounts.get(length) || 0) + 1);
  });
  
  // 가장 많이 사용되는 벡터 길이 선택
  let mostCommonLength = 0;
  let maxCount = 0;
  for (const [length, count] of lengthCounts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonLength = length;
    }
  }
  
  if (mostCommonLength === 0) {
    console.error("[임베딩 계산] 유효한 벡터 길이를 찾을 수 없습니다.");
    return null;
  }
  
  // 공통 길이와 일치하는 임베딩들만 사용
  const consistentEmbeddings = validEmbeddings.filter(emb => emb.length === mostCommonLength);
  
  if (consistentEmbeddings.length === 0) {
    console.error("[임베딩 계산] 일관된 길이의 임베딩 벡터가 없습니다.");
    return null;
  }
  
  // 필터링된 벡터가 있다면 경고 로그 출력
  if (consistentEmbeddings.length < validEmbeddings.length) {
    const filteredCount = validEmbeddings.length - consistentEmbeddings.length;
    console.warn(`[임베딩 계산] ${filteredCount}개의 비일관적 길이 벡터를 제외했습니다. (표준 길이: ${mostCommonLength})`);
  }

  // 평균 벡터 계산
  const avgEmbedding = new Array(mostCommonLength).fill(0);
  for (const embedding of consistentEmbeddings) {
    for (let i = 0; i < mostCommonLength; i++) {
      avgEmbedding[i] += embedding[i];
    }
  }

  // 평균 계산
  for (let i = 0; i < mostCommonLength; i++) {
    avgEmbedding[i] /= consistentEmbeddings.length;
  }
  
  console.log(`[임베딩 계산] ${consistentEmbeddings.length}개 벡터 (길이: ${mostCommonLength})로 평균 임베딩 계산 완료`);
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
 * 레시피에 대한 임베딩 점수 계산 (새로운 RPC 사용 - 성능 최적화)
 */
export async function calculateEmbeddingScoreForRecipe(recipeId: string, userEmbedding: number[]): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('calculate_recipe_similarity', {
      recipe_id: recipeId,
      query_embedding: userEmbedding
    });

    if (error) {
      console.error(`레시피 ${recipeId} 임베딩 점수 계산 오류:`, error);
      return 0;
    }

    // RPC는 float 값을 직접 반환
    return data || 0;
  } catch (error) {
    console.error(`레시피 ${recipeId} 임베딩 점수 계산 중 예외:`, error);
    return 0;
  }
} 