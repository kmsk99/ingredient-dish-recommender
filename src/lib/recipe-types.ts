/**
 * 레시피 관련 타입 정의
 */

export interface RecipeIngredient {
  ingredient: {
    id: string;
    name: string;
  };
}

export interface IngredientEmbedding {
  name: string;
  embedding: number[] | null;
}

/**
 * 하이브리드 결과 타입 정의
 */
export interface HybridRecipeResult {
  id: string;
  title: string;
  short_title: string;
  raw_ingredients: string;
  image_url: string;
  similarity: number;
  sourceType: 'hybrid' | 'embedding' | 'basic';
  finalScore: number;
  score?: {
    similarity?: number;
    weightedScore: number;
    matchCount: number;
    matchRatio: number;
    recipeIngredientCoverage: number;
  };
  hybridScore?: {
    embeddingScore: number;
    basicScore: number;
    matchCount: number;
  };
} 