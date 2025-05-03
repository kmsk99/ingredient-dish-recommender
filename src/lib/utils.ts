import { recommendRecipesByIngredients } from './recipe-utils';

// 애플리케이션 전반에서 사용되는 타입 정의
export interface Recipe {
  id: string;
  title: string;
  short_title?: string;
  ingredients: string[];
  raw_ingredients?: string;
  image_url?: string;
  description?: string;
  viewCount?: number;
  recommendCount?: number;
  scrapCount?: number;
  difficulty?: string;
  time?: string;
  servings?: string;
  rawIngredients?: string;
  similarity?: number; // 임베딩 기반 유사도 점수
  [key: string]: any; // 기타 속성
}

export interface RecipeWithScore extends Recipe {
  score: {
    matchCount: number;
    matchRatio: number;
    weightedScore: number;
    recipeIngredientCoverage: number;
    similarity?: number; // 임베딩 기반 유사도 점수
  };
}

export interface IngredientWithCount {
  name: string;
  count: number;
}

export interface RecommendedRecipe {
  id: string;
  title: string;
  short_title?: string;
  raw_ingredients?: string;
  image_url?: string;
  similarity: number;
}

// 문자열이 유효한 URL인지 확인
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 유사도 점수를 퍼센트로 변환 (소수점 첫째 자리까지)
export function similarityToPercent(similarity: number): string {
  return `${Math.round(similarity * 1000) / 10}%`;
}

// 사용자 입력 재료 문자열을 배열로 파싱
export function parseUserIngredients(ingredientsStr: string): string[] {
  if (!ingredientsStr) return [];
  
  return ingredientsStr
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// ID로 레시피 상세 정보 가져오기
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`/api/recipes/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`레시피 ID ${id}를 찾을 수 없습니다.`);
        return null;
      }
      throw new Error(`레시피를 가져오는데 실패했습니다: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('레시피 상세 가져오기 오류:', error);
    return null;
  }
}

// 재료에 기반한 추천 레시피 가져오기
export async function getRecommendedRecipes(ingredients: string[]): Promise<RecipeWithScore[]> {
  try {
    if (ingredients.length === 0) return [];
    
    try {
      const embeddingData = await recommendRecipesByIngredients(ingredients);
      
      // 임베딩 기반 결과가 있으면 반환
      if (embeddingData && embeddingData.length > 0) {
        console.log("[클라이언트 임베딩] 추천 성공:", embeddingData.length);
        
        // RecommendedRecipe를 RecipeWithScore 형식으로 변환
        return embeddingData.map((recipe: RecommendedRecipe) => ({
          ...recipe,
          ingredients: recipe.raw_ingredients ? 
            recipe.raw_ingredients.split(',').map(i => i.trim()) : [],
          score: {
            matchCount: 1,
            matchRatio: recipe.similarity,
            weightedScore: recipe.similarity,
            recipeIngredientCoverage: recipe.similarity
          }
        }));
      }
    } catch (embeddingError) {
      console.error("[클라이언트 임베딩] 오류:", embeddingError);
      // 클라이언트 임베딩 추천 실패 시 폴백
    }
    
    // 여기까지 왔다면 클라이언트 임베딩이 실패했으므로 폴백 사용
    console.log("[클라이언트 임베딩] 폴백 메커니즘 사용");
    
    // 기존 서버 API를 폴백으로 사용 (이전 API 유지)
    const ingredientsQuery = encodeURIComponent(ingredients.join(','));
    const fallbackResponse = await fetch(`/api/recipes/recommend?ingredients=${ingredientsQuery}`);
    
    if (!fallbackResponse.ok) {
      throw new Error(`추천 레시피를 가져오는데 실패했습니다: ${fallbackResponse.status}`);
    }
    
    return await fallbackResponse.json();
  } catch (error) {
    console.error('추천 레시피 가져오기 오류:', error);
    return [];
  }
}
