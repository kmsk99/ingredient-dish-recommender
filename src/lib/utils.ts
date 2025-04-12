export interface Recipe {
  id: string;
  title: string;
  shortTitle: string;
  registerId: string;
  registerName: string;
  viewCount: number;
  recommendCount: number;
  scrapCount: number;
  method: string;
  situation: string;
  materialCategory: string;
  kind: string;
  description: string;
  rawIngredients: string;
  servings: string;
  difficulty: string;
  time: string;
  firstRegisterDate: string;
  imageUrl: string;
  ingredients: string[];
}

export interface RecipeWithScore extends Recipe {
  score: {
    matchCount: number;
    matchRatio: number;
    weightedScore: number;
    recipeIngredientCoverage: number;
  };
}

export interface IngredientWithCount {
  name: string;
  count: number;
}

// 모든 레시피 데이터 가져오기 - 클라이언트 측에서 호출
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    // 서버 사이드에서는 상대 경로 사용
    const url = typeof window === 'undefined' 
      ? '/api/recipes'
      : `${window.location.origin}/api/recipes`;
    
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('레시피를 가져오는데 실패했습니다');
    }
    return response.json();
  } catch (error) {
    console.error('레시피 목록 요청 중 오류:', error);
    return [];
  }
}

// 재료 목록으로 레시피 추천 - 클라이언트 측에서 호출
export async function getRecommendedRecipes(userIngredients: string[]): Promise<RecipeWithScore[]> {
  try {
    const query = encodeURIComponent(userIngredients.join(','));
    
    // 서버 사이드에서는 상대 경로 사용
    const url = typeof window === 'undefined' 
      ? `/api/recipes/recommend?ingredients=${query}`
      : `${window.location.origin}/api/recipes/recommend?ingredients=${query}`;
    
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('추천 레시피를 가져오는데 실패했습니다');
    }
    return response.json();
  } catch (error) {
    console.error('추천 레시피 요청 중 오류:', error);
    return [];
  }
}

// ID로 레시피 가져오기 - 클라이언트 측에서 호출
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    // 서버 사이드에서는 상대 경로 사용
    const url = typeof window === 'undefined' 
      ? `/api/recipes/${id}`
      : `${window.location.origin}/api/recipes/${id}`;
    
    const response = await fetch(url, { 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('레시피를 가져오는데 실패했습니다');
    }
    return response.json();
  } catch (error) {
    console.error('레시피 데이터 요청 중 오류:', error);
    return null;
  }
}

// 사용자 입력 문자열에서 재료 목록 추출
export function parseUserIngredients(input: string): string[] {
  if (!input) return [];
  
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// 모든 재료 목록 가져오기 (자동완성용) - 클라이언트 측에서 호출
export async function getAllIngredients(): Promise<IngredientWithCount[]> {
  try {
    // 서버 사이드에서는 상대 경로 사용
    const url = typeof window === 'undefined' 
      ? '/api/ingredients'
      : `${window.location.origin}/api/ingredients`;
    
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('재료 목록을 가져오는데 실패했습니다');
    }
    return response.json();
  } catch (error) {
    console.error('재료 목록 요청 중 오류:', error);
    return [];
  }
}
