import { Database, Tables } from '@/supabase/types/database.types';

// 데이터베이스 테이블 행 타입
export interface RecipeRow extends Tables<'recipes'>  {
  ingredients: string[]
}

export type IngredientRow = Tables<'ingredients'>;
export type RecipeIngredientRow = Tables<'recipe_ingredients'>;

// Recipe 타입 추가 - RecipeRow 확장
export interface Recipe extends RecipeRow {
  score?: {
    matchCount?: number;
    matchRatio?: number;
    weightedScore?: number;
    recipeIngredientCoverage?: number;
    similarity?: number;
  };
}

// match_recipes 함수 반환 타입
export type MatchRecipeResult = Database['public']['Functions']['match_recipes']['Returns'][0];

// 필수 확장 타입 - DB에 없는 추가 속성
export interface RecipeWithScore extends RecipeRow {
  ingredients: string[];  // 재료 목록
  score: {
    matchCount: number;
    matchRatio: number;
    weightedScore: number;
    recipeIngredientCoverage: number;
    similarity?: number;
  };
}

// 재료 이름과 개수를 포함하는 타입
export interface IngredientWithCount {
  name: string;
  count: number;
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