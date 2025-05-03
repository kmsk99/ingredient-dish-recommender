import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

// 추천 결과 타입 정의
interface RecommendedRecipe {
  id: string;
  title: string;
  short_title?: string;
  raw_ingredients?: string;
  image_url?: string;
  similarity: number;
}

// 재료 임베딩 타입 정의
interface IngredientEmbedding {
  name: string;
  embedding: number[] | null;
}

// 벡터 평균 계산 함수
function calculateAverageEmbedding(embeddings: number[][]): number[] | null {
  if (!embeddings || embeddings.length === 0) {
    console.log('[폴백 로그] 임베딩 배열이 비어있거나 undefined입니다.');
    return null;
  }
  
  // 모든 벡터의 길이가 동일한지 확인
  const vectorLength = embeddings[0]?.length ?? 0;
  if (vectorLength === 0) {
    console.log('[폴백 로그] 첫 번째 임베딩 벡터의 길이가 0입니다.');
    return null;
  }

  // 모든 벡터의 길이가 동일한지 확인
  const allSameLength = embeddings.every(emb => emb.length === vectorLength);
  if (!allSameLength) {
    console.error("[폴백 로그] 임베딩 벡터 길이가 일치하지 않습니다.");
    const lengthInfo = embeddings.map((emb, idx) => `임베딩[${idx}]: ${emb.length}`).join(', ');
    console.error(`[폴백 로그] 벡터 길이 정보: ${lengthInfo}`);
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

// 정규화된 임베딩 벡터 생성 (길이가 1인 벡터로 변환)
function normalizeEmbedding(embedding: number[]): number[] {
  // 벡터의 크기(magnitude) 계산
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  // 0으로 나누기 방지
  if (magnitude === 0) {
    console.log('[폴백 로그] 임베딩 벡터의 크기(magnitude)가 0입니다. 정규화를 건너뜁니다.');
    return embedding;
  }
  
  // 각 요소를 크기로 나누어 정규화
  return embedding.map(val => val / magnitude);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // 쉼표로 구분된 재료 이름 목록
    const ingredientsNamesParam = searchParams.get('names');

    if (!ingredientsNamesParam || !ingredientsNamesParam.trim()) {
      console.log('[폴백 로그] 재료 이름 목록이 비어있거나 제공되지 않았습니다.');
      return NextResponse.json(
        { error: '재료 이름 목록이 필요합니다.' }, 
        { status: 400 }
      );
    }

    // 쉼표로 구분된 문자열을 배열로 변환하고 공백 제거
    const selectedIngredientNames = ingredientsNamesParam
      .split(',')
      .map(name => name.trim().toLowerCase()) // 소문자로 변환하여 매칭 향상
      .filter(name => name.length > 0);

    console.log(`[폴백 로그] 검색 재료: ${selectedIngredientNames.join(', ')}`);

    if (selectedIngredientNames.length === 0) {
      console.log('[폴백 로그] 유효한 재료 이름이 필터링 후 없습니다.');
      return NextResponse.json(
        { error: '최소 하나 이상의 재료가 필요합니다.' }, 
        { status: 400 }
      );
    }

    // 1. 선택된 재료들의 임베딩 벡터를 DB에서 조회 (ILIKE 사용으로 대소문자 무시)
    const { data: ingredientEmbeddings, error: embeddingError } = await supabase
      .from('ingredients')
      .select('name, embedding')
      .or(selectedIngredientNames.map(name => `name.ilike.${name}`).join(','));

    if (embeddingError) {
      console.error('[폴백 로그] 재료 임베딩 조회 오류:', embeddingError);
      console.error(`[폴백 로그] 오류 코드: ${embeddingError.code}, 메시지: ${embeddingError.message}`);
      console.error(`[폴백 로그] 검색된 재료: ${selectedIngredientNames.join(', ')}`);
      // 오류 발생 시 빈 배열 반환 (폴백 메커니즘으로 기본 추천 사용)
      return NextResponse.json([]);
    }

    console.log(ingredientEmbeddings);

    // 중요: 먼저 임베딩 문자열을 배열로 변환
    if (ingredientEmbeddings && ingredientEmbeddings.length > 0) {
      // 임베딩 구조 자세히 로그
      ingredientEmbeddings.forEach((ing, idx) => {
        console.log(`[디버그] 재료 #${idx+1} "${ing.name}":`);
        console.log(`  embedding 존재 여부: ${ing.embedding !== null && ing.embedding !== undefined}`);
        console.log(`  embedding 타입: ${typeof ing.embedding}`);
        console.log(`  배열 여부: ${Array.isArray(ing.embedding)}`);
        
        // 임베딩이 문자열인 경우 JSON으로 파싱 시도
        if (ing.embedding && typeof ing.embedding === 'string') {
          try {
            const parsedEmbedding = JSON.parse(ing.embedding);
            if (Array.isArray(parsedEmbedding)) {
              ing.embedding = parsedEmbedding;
              console.log(`[폴백 로그] "${ing.name}" 재료의 임베딩 문자열을 배열로 파싱 성공 (길이: ${parsedEmbedding.length})`);
            }
          } catch (e) {
            console.error(`[폴백 로그] "${ing.name}" 재료의 임베딩 문자열 파싱 실패:`, e);
          }
        }
        
        // 파싱 후 상태
        if (ing.embedding) {
          if (Array.isArray(ing.embedding)) {
            console.log(`  파싱 후 배열 길이: ${ing.embedding.length}`);
            console.log(`  첫 5개 요소: ${JSON.stringify(ing.embedding.slice(0, 5))}`);
          }
        }
      });
    }

    // DB에서 찾은 재료 로깅
    if (ingredientEmbeddings) {
      const foundNames = ingredientEmbeddings.map(ing => ing.name);
      console.log(`[폴백 로그] DB에서 찾은 재료: ${foundNames.join(', ')} (총 ${foundNames.length}개)`);
      
      // 찾지 못한 재료 로깅
      const notFoundIngredients = selectedIngredientNames.filter(name => 
        !ingredientEmbeddings.some(ing => ing.name.toLowerCase() === name.toLowerCase())
      );
      if (notFoundIngredients.length > 0) {
        console.log(`[폴백 로그] DB에서 찾지 못한 재료: ${notFoundIngredients.join(', ')}`);
      }
      
      // 임베딩 없는 재료 로깅 - 이제 파싱 후의 상태로 체크
      const ingredientsWithoutEmbedding = ingredientEmbeddings.filter(ing => !ing.embedding || !Array.isArray(ing.embedding));
      if (ingredientsWithoutEmbedding.length > 0) {
        console.log(`[폴백 로그] 임베딩 없는 재료: ${ingredientsWithoutEmbedding.map(ing => ing.name).join(', ')}`);
      }
    } else {
      console.log(`[폴백 로그] DB에서 재료를 전혀 찾지 못했습니다: ${selectedIngredientNames.join(', ')}`);
    }

    // 임베딩이 있는 재료만 필터링
    const validIngredients = ingredientEmbeddings?.filter(
      (ing): ing is IngredientEmbedding & { embedding: number[] } => 
        ing.embedding !== null && Array.isArray(ing.embedding) && ing.embedding.length > 0
    );

    if (!validIngredients || validIngredients.length === 0) {
      // 임베딩이 없는 경우 로그만 남기고 빈 배열 반환 (폴백 메커니즘 작동)
      const foundIngredients = ingredientEmbeddings?.map(ing => ing.name).join(', ') || '없음';
      console.log(`[폴백 로그] 임베딩 기반 추천 불가: 선택된 재료 ${selectedIngredientNames.join(', ')}의 유효한 임베딩 없음.`);
      console.log(`[폴백 로그] 실제 DB에서 찾은 재료 정보: ${foundIngredients}`);
      console.log('[폴백 로그] 폴백 메커니즘 작동: 기본 추천으로 대체');
      
      return NextResponse.json([]);
    }

    console.log(`[폴백 로그] 유효한 임베딩이 있는 재료: ${validIngredients.map(ing => ing.name).join(', ')} (총 ${validIngredients.length}개)`);

    // 2. 조회된 임베딩 벡터들의 평균 계산
    const validEmbeddings = validIngredients.map(ing => ing.embedding);
    
    // 코드베이스에 EMBEDDING_DIM 상수가 정의되어 있지 않다면 임베딩 길이를 동적으로 결정
    const EMBEDDING_DIM = validEmbeddings[0]?.length || 768; // 기본값 768 (많은 모델의 기본 차원)
    console.log(`[폴백 로그] 임베딩 차원 정보: ${EMBEDDING_DIM}`);
    
    const embeddings = validEmbeddings.filter(emb => emb && Array.isArray(emb) && emb.length === EMBEDDING_DIM);
    
    if (embeddings.length !== validEmbeddings.length) {
      console.log(`[폴백 로그] 차원이 일치하지 않는 임베딩 발견: 총 ${validEmbeddings.length}개 중 ${embeddings.length}개만 유효`);
      // 차원이 다른 임베딩 로깅
      validIngredients.forEach((ing, idx) => {
        if (ing.embedding.length !== EMBEDDING_DIM) {
          console.log(`[폴백 로그] 차원 불일치 재료: ${ing.name}, 차원: ${ing.embedding.length} (예상: ${EMBEDDING_DIM})`);
        }
      });
    }
    
    const averageEmbedding = calculateAverageEmbedding(embeddings);

    if (!averageEmbedding) {
      // 평균 계산 실패 시 로그만 남기고 빈 배열 반환 (폴백 메커니즘 작동)
      const ingredientList = validIngredients.map(ing => ing.name).join(', ');
      console.log(`[폴백 로그] 임베딩 평균 계산 실패: [${ingredientList}]`);
      console.log(`[폴백 로그] 임베딩 개수: ${embeddings.length}, 차원: ${EMBEDDING_DIM}`);
      console.log('[폴백 로그] 폴백 메커니즘 작동: 기본 추천으로 대체');
      
      return NextResponse.json([]);
    }

    // 임베딩 벡터 정규화 (Supabase pgvector의 cosine_distance 연산에 중요할 수 있음)
    const normalizedEmbedding = normalizeEmbedding(averageEmbedding);

    // 3. RPC 호출을 위한 설정
    const matchThreshold = 0.01; // 유사도 임계값을 0.01로 낮춰 더 많은 결과 반환
    const matchCount = 15;     // 최대 15개 결과로 증가

    // 4. 평균 임베딩 벡터를 사용하여 match_recipes 함수 호출
    console.log(`[폴백 로그] RPC 호출: match_recipes (threshold=${matchThreshold}, count=${matchCount})`);
    const { data: recommendationsData, error: rpcError } = await supabase.rpc('match_recipes', {
      query_embedding: normalizedEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (rpcError) {
      console.error('[폴백 로그] 레시피 추천 RPC 오류:', rpcError);
      console.error(`[폴백 로그] RPC 오류 코드: ${rpcError.code}, 메시지: ${rpcError.message}`);
      console.error('[폴백 로그] 폴백 메커니즘 작동: 기본 추천으로 대체');
      // RPC 오류 시 빈 배열 반환 (폴백 메커니즘 작동)
      return NextResponse.json([]);
    }

    // 5. 결과 처리 및 반환
    const recommendations = (recommendationsData as RecommendedRecipe[]) ?? [];
    
    // 결과가 없으면 로그만 남김
    if (recommendations.length === 0) {
      console.log(`[폴백 로그] 재료 [${selectedIngredientNames.join(', ')}]로 매칭되는 레시피가 없습니다.`);
      console.log('[폴백 로그] 폴백 메커니즘 작동: 기본 추천으로 대체');
    } else {
      console.log(`[폴백 로그] 성공적으로 ${recommendations.length}개 레시피 추천됨`);
      // 상위 5개만 로깅
      recommendations.slice(0, 5).forEach((recipe, idx) => {
        console.log(`[폴백 로그] 추천 #${idx+1}: ${recipe.title} (유사도: ${recipe.similarity.toFixed(4)})`);
      });
    }

    return NextResponse.json(recommendations);

  } catch (error: any) {
    console.error('[폴백 로그] 재료 기반 추천 API 예외 발생:', error);
    console.error(`[폴백 로그] 오류 메시지: ${error.message}`);
    console.error(`[폴백 로그] 오류 스택: ${error.stack}`);
    console.error('[폴백 로그] 폴백 메커니즘 작동: 기본 추천으로 대체');
    // 최종 오류 시에도 빈 배열 반환하여 폴백 메커니즘 작동
    return NextResponse.json([]);
  }
} 