import { MatchRecipeResult, Recipe, RecipeWithScore } from './types';

// ID로 레시피 상세 정보 가져오기
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    // recipe-utils.ts의 getRecipeById 함수 사용
    const { getRecipeById: fetchRecipeById } = await import('./recipe-utils');
    const recipe = await fetchRecipeById(id);
    
    // RecipeRow에서 Recipe로 변환
    if (recipe) {
      return recipe
    }
    
    return null;
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
      const { recommendRecipesByIngredients } = await import('./recipe-utils');
      
      // 임베딩 기반 결과가 있으면 반환
      const embeddingData = await recommendRecipesByIngredients(ingredients);
      
      if (embeddingData && embeddingData.length > 0) {
        console.log("[클라이언트 임베딩] 추천 성공:", embeddingData.length);
        
        // MatchRecipeResult를 RecipeWithScore 형식으로 변환
        return embeddingData.map((recipe: MatchRecipeResult) => ({
          id: recipe.id,
          title: recipe.title,
          short_title: recipe.short_title,
          image_url: recipe.image_url,
          raw_ingredients: recipe.raw_ingredients,
          created_at: '',
          updated_at: '',
          description: null,
          difficulty: null,
          embedding: null,
          first_register_date: null,
          kind: null,
          material_category: null,
          method: null,
          recommend_count: null,
          register_id: null,
          register_name: null,
          scrap_count: null,
          servings: null,
          situation: null,
          time: null,
          view_count: null,
          ingredients: recipe.raw_ingredients ? 
            recipe.raw_ingredients.split(',').map(i => i.trim()) : [],
          score: {
            matchCount: 1,
            matchRatio: recipe.similarity,
            weightedScore: recipe.similarity,
            recipeIngredientCoverage: recipe.similarity,
            similarity: recipe.similarity
          }
        }));
      }
    } catch (embeddingError) {
      console.error("[클라이언트 임베딩] 오류:", embeddingError);
      // 클라이언트 임베딩 추천 실패 시 폴백
    }
    
    // 여기까지 왔다면 클라이언트 임베딩이 실패했으므로 폴백 사용
    console.log("[클라이언트 임베딩] 폴백 메커니즘 사용");
    
    // recommendRecipesByBasicMatching 함수 사용
    const { recommendRecipesByBasicMatching } = await import('./recipe-utils');
    return await recommendRecipesByBasicMatching(ingredients);
  } catch (error) {
    console.error('추천 레시피 가져오기 오류:', error);
    return [];
  }
}
