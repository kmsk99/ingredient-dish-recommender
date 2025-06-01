// 메인 레시피 유틸리티 파일 - 모든 기능을 통합 export

// 기본 레시피 조회 및 매칭
export { 
  getRecipes, 
  getRecipeById, 
  recommendRecipesByBasicMatching,
  calculateBasicScoreForRecipe 
} from './recipe-basic';

// 임베딩 관련 기능
export { 
  getIngredientsEmbeddings,
  calculateAverageEmbedding,
  normalizeEmbedding,
  findSimilarRecipes,
  calculateEmbeddingScoreForRecipe
} from './recipe-embedding';

// 하이브리드 추천 (메인 추천 함수)
export { 
  recommendRecipesByIngredients 
} from './recipe-hybrid';

// 타입 re-export
export type { 
  RecipeIngredient,
  IngredientEmbedding,
  HybridRecipeResult 
} from './recipe-types'; 