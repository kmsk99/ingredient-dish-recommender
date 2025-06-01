import {
  calculateBasicScoreForRecipe,
  recommendRecipesByBasicMatching,
} from './recipe-basic';
import {
  calculateAverageEmbedding,
  calculateEmbeddingScoreForRecipe,
  findSimilarRecipes,
  getIngredientsEmbeddings,
  normalizeEmbedding,
} from './recipe-embedding';
import { HybridRecipeResult } from './recipe-types';
import { MatchRecipeResult, RecipeWithScore } from './types';

/**
 * 재료 이름으로 레시피 추천 - 진짜 하이브리드 (모든 레시피에 양쪽 점수 계산)
 */
export async function recommendRecipesByIngredients(
  ingredientNames: string[]
): Promise<MatchRecipeResult[]> {
  try {
    console.log(`[하이브리드 추천] 시작: ${ingredientNames.join(', ')}`);
    
    let embeddingResults: MatchRecipeResult[] = [];
    let basicResults: RecipeWithScore[] = [];
    let userEmbedding: number[] | null = null;
    
    // 1단계: 임베딩 기반 추천 시도
    try {
      const ingredientEmbeddings = await getIngredientsEmbeddings(ingredientNames);
      
      // 임베딩이 검색된 재료들 로깅
      const foundEmbeddings = ingredientEmbeddings.filter(item => item.embedding !== null);
      const notFoundIngredients = ingredientNames.filter(name => 
        !foundEmbeddings.some(emb => emb.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(emb.name.toLowerCase()))
      );
      
      if (foundEmbeddings.length > 0) {
        console.log(`[임베딩 검색] 성공한 재료 (${foundEmbeddings.length}개): ${foundEmbeddings.map(e => e.name).join(', ')}`);
      }
      if (notFoundIngredients.length > 0) {
        console.log(`[임베딩 검색] 실패한 재료 (${notFoundIngredients.length}개): ${notFoundIngredients.join(', ')}`);
      }
      
      const validEmbeddings = foundEmbeddings.map(item => item.embedding as number[]);
      
      if (validEmbeddings.length > 0) {
        const averageEmbedding = calculateAverageEmbedding(validEmbeddings);
        
        if (averageEmbedding) {
          userEmbedding = normalizeEmbedding(averageEmbedding);
          embeddingResults = await findSimilarRecipes(userEmbedding, 0.3, 20);
          console.log(`[임베딩 추천] ${embeddingResults.length}개 레시피 발견`);
        }
      }
    } catch (error) {
      console.log("[임베딩 추천] 오류 발생:", error);
    }
    
    // 2단계: 기본 매칭 추천 (항상 실행)
    try {
      basicResults = await recommendRecipesByBasicMatching(ingredientNames);
      console.log(`[기본 매칭] ${basicResults.length}개 레시피 발견`);
    } catch (error) {
      console.log("[기본 매칭] 오류 발생:", error);
    }
    
    // 3단계: 진짜 하이브리드 점수 계산
    if (embeddingResults.length === 0 && basicResults.length === 0) {
      console.log("[하이브리드 추천] 두 방식 모두 결과 없음");
      return [];
    }
    
    const allRecipes = new Map<string, HybridRecipeResult>();
    
    // 임베딩 결과들에 기본 매칭 점수 추가 계산
    console.log("[하이브리드 계산] 임베딩 결과에 기본 점수 추가 중...");
    for (const recipe of embeddingResults) {
      const basicScore = await calculateBasicScoreForRecipe(recipe.id, ingredientNames);
      
      allRecipes.set(recipe.id, {
        ...recipe,
        sourceType: 'hybrid' as const,
        finalScore: (recipe.similarity * 0.5) + (basicScore * 0.5),
        hybridScore: {
          embeddingScore: recipe.similarity,
          basicScore: basicScore,
          matchCount: 0 // 기본 점수 계산에서 가져올 수 있지만 간단히 0으로
        }
      });
      
      if (basicScore > 0) {
        console.log(`[하이브리드 매치] "${recipe.title}" - 임베딩(${recipe.similarity.toFixed(3)}) + 기본(${basicScore.toFixed(3)})`);
      }
    }
    
    // 기본 매칭 결과들에 임베딩 점수 추가 계산 (임베딩이 있는 경우만)
    if (userEmbedding) {
      console.log("[하이브리드 계산] 기본 매칭 결과에 임베딩 점수 추가 중...");
      for (const recipe of basicResults) {
        const existing = allRecipes.get(recipe.id);
        
        if (!existing) {
          // 새로운 레시피인 경우
          const embeddingScore = await calculateEmbeddingScoreForRecipe(recipe.id, userEmbedding);
          
          allRecipes.set(recipe.id, {
            id: recipe.id,
            title: recipe.title,
            short_title: recipe.short_title || '',
            raw_ingredients: recipe.raw_ingredients || '',
            image_url: recipe.image_url || '',
            similarity: (recipe.score.weightedScore * 0.5) + (embeddingScore * 0.5),
            sourceType: 'hybrid' as const,
            finalScore: (recipe.score.weightedScore * 0.5) + (embeddingScore * 0.5),
            hybridScore: {
              embeddingScore: embeddingScore,
              basicScore: recipe.score.weightedScore,
              matchCount: recipe.score.matchCount
            }
          });
          
          if (embeddingScore > 0) {
            console.log(`[하이브리드 매치] "${recipe.title}" - 기본(${recipe.score.weightedScore.toFixed(3)}) + 임베딩(${embeddingScore.toFixed(3)})`);
          }
        }
        // existing이 있는 경우는 이미 임베딩에서 처리됨
      }
    } else {
      // 임베딩이 없는 경우 기본 매칭 결과만 추가
      for (const recipe of basicResults) {
        if (!allRecipes.has(recipe.id)) {
          allRecipes.set(recipe.id, {
            id: recipe.id,
            title: recipe.title,
            short_title: recipe.short_title || '',
            raw_ingredients: recipe.raw_ingredients || '',
            image_url: recipe.image_url || '',
            similarity: recipe.score.weightedScore,
            sourceType: 'basic' as const,
            finalScore: recipe.score.weightedScore,
            score: recipe.score
          });
        }
      }
    }
    
    // 4단계: 최종 정렬 및 반환
    const finalResults = Array.from(allRecipes.values())
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 20)
      .map(item => ({
        id: item.id,
        title: item.title,
        short_title: item.short_title,
        raw_ingredients: item.raw_ingredients,
        image_url: item.image_url,
        similarity: item.finalScore
      }));
    
    // 결과 로깅
    const hybridCount = Array.from(allRecipes.values()).filter(r => r.sourceType === 'hybrid').length;
    const basicOnlyCount = Array.from(allRecipes.values()).filter(r => r.sourceType === 'basic').length;
    
    console.log(`[하이브리드 결과] 총 ${finalResults.length}개 - 하이브리드: ${hybridCount}개, 기본만: ${basicOnlyCount}개`);
    
    return finalResults;
    
  } catch (error) {
    console.error("하이브리드 레시피 추천 중 오류:", error);
    return [];
  }
} 