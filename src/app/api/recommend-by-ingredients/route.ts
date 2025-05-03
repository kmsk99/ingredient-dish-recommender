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
    return null;
  }
  
  // 모든 벡터의 길이가 동일한지 확인
  const vectorLength = embeddings[0]?.length ?? 0;
  if (vectorLength === 0) {
    return null;
  }

  // 모든 벡터의 길이가 동일한지 확인
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

// 정규화된 임베딩 벡터 생성 (길이가 1인 벡터로 변환)
function normalizeEmbedding(embedding: number[]): number[] {
  // 벡터의 크기(magnitude) 계산
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  // 0으로 나누기 방지
  if (magnitude === 0) {
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
      return NextResponse.json(
        { error: '재료 이름 목록이 필요합니다.' }, 
        { status: 400 }
      );
    }

    // 쉼표로 구분된 문자열을 배열로 변환하고 공백 제거
    const selectedIngredientNames = ingredientsNamesParam
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (selectedIngredientNames.length === 0) {
      return NextResponse.json(
        { error: '최소 하나 이상의 재료가 필요합니다.' }, 
        { status: 400 }
      );
    }

    // 1. 선택된 재료들의 임베딩 벡터를 DB에서 조회
    const { data: ingredientEmbeddings, error: embeddingError } = await supabase
      .from('ingredients')
      .select('name, embedding')
      .in('name', selectedIngredientNames);

    if (embeddingError) {
      console.error('재료 임베딩 조회 오류:', embeddingError);
      return NextResponse.json(
        { error: `재료 임베딩을 가져오는 중 오류가 발생했습니다: ${embeddingError.message}` }, 
        { status: 500 }
      );
    }

    // 임베딩이 있는 재료만 필터링
    const validIngredients = ingredientEmbeddings?.filter(
      (ing): ing is IngredientEmbedding & { embedding: number[] } => 
        ing.embedding !== null && Array.isArray(ing.embedding) && ing.embedding.length > 0
    );

    if (!validIngredients || validIngredients.length === 0) {
      const foundIngredients = ingredientEmbeddings?.map(ing => ing.name).join(', ') || '없음';
      console.warn(`선택된 재료의 유효한 임베딩이 없습니다. 조회된 재료: ${foundIngredients}`);
      
      return NextResponse.json(
        { error: '선택한 재료의 유효한 임베딩을 찾을 수 없습니다.' }, 
        { status: 404 }
      );
    }

    // 2. 조회된 임베딩 벡터들의 평균 계산
    const validEmbeddings = validIngredients.map(ing => ing.embedding);
    
    // 코드베이스에 EMBEDDING_DIM 상수가 정의되어 있지 않다면 임베딩 길이를 동적으로 결정
    const EMBEDDING_DIM = validEmbeddings[0]?.length || 768; // 기본값 768 (많은 모델의 기본 차원)
    
    const embeddings = validEmbeddings.filter(emb => emb && Array.isArray(emb) && emb.length === EMBEDDING_DIM);
    const averageEmbedding = calculateAverageEmbedding(embeddings);

    if (!averageEmbedding) {
      const ingredientList = validIngredients.map(ing => ing.name).join(', ');
      console.error(`재료 임베딩 평균 계산 실패: [${ingredientList}]`);
      
      return NextResponse.json(
        { error: '평균 임베딩을 계산할 수 없습니다.' }, 
        { status: 500 }
      );
    }

    // 임베딩 벡터 정규화 (Supabase pgvector의 cosine_distance 연산에 중요할 수 있음)
    const normalizedEmbedding = normalizeEmbedding(averageEmbedding);

    // 3. RPC 호출을 위한 설정
    const matchThreshold = 0.01; // 유사도 임계값을 0.01로 낮춰 더 많은 결과 반환
    const matchCount = 15;     // 최대 15개 결과로 증가

    // 4. 평균 임베딩 벡터를 사용하여 match_recipes 함수 호출
    const { data: recommendationsData, error: rpcError } = await supabase.rpc('match_recipes', {
      query_embedding: normalizedEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (rpcError) {
      console.error('레시피 추천 RPC 오류:', rpcError);
      return NextResponse.json(
        { error: `레시피 추천을 가져오는 중 오류가 발생했습니다: ${rpcError.message}` }, 
        { status: 500 }
      );
    }

    // 5. 결과 처리 및 반환
    const recommendations = (recommendationsData as RecommendedRecipe[]) ?? [];
    
    // 결과가 없으면 사용자에게 적절한 메시지 제공
    if (recommendations.length === 0) {
      console.log(`재료 [${selectedIngredientNames.join(', ')}]로 매칭되는 레시피가 없습니다.`);
    }

    return NextResponse.json(recommendations);

  } catch (error: any) {
    console.error('재료 기반 추천 API 오류:', error);
    return NextResponse.json(
      { error: error.message || '내부 서버 오류' }, 
      { status: 500 }
    );
  }
} 