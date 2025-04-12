import fs from 'fs';
import path from 'path';

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
  };
}

export interface IngredientWithCount {
  name: string;
  count: number;
}

// 모든 레시피 데이터 가져오기
export async function getAllRecipes(): Promise<Recipe[]> {
  const filePath = path.join(process.cwd(), 'src/data/processed_recipes.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const recipes = JSON.parse(fileContents);
  return recipes;
}

// 재료 목록으로 레시피 추천
export async function getRecommendedRecipes(userIngredients: string[]): Promise<RecipeWithScore[]> {
  const recipes = await getAllRecipes();
  
  // 재료 이름을 소문자로 변환하고 공백 제거
  const normalizedUserIngredients = userIngredients.map(ing => 
    ing.toLowerCase().trim()
  );
  
  // 각 레시피에 대해 사용자 재료가 얼마나 포함되는지 계산
  const recipesWithScore = recipes.map(recipe => {
    const recipeIngredients = recipe.ingredients.map(ing => 
      ing.toLowerCase().trim()
    );
    
    // 사용자 재료 중 레시피에 포함된 재료 수
    const matchCount = normalizedUserIngredients.filter(userIng => 
      recipeIngredients.some(recipeIng => recipeIng.includes(userIng))
    ).length;
    
    const score = {
      matchCount,
      matchRatio: matchCount / normalizedUserIngredients.length,
      // 가중치를 주어 정렬 (일치하는 재료가 많을수록, 레시피 재료가 적을수록 상위에 표시)
      weightedScore: matchCount / recipeIngredients.length
    };
    
    return { ...recipe, score };
  });
  
  // 매칭되는 재료가 하나도 없는 레시피는 제외
  const filteredRecipes = recipesWithScore.filter(recipe => recipe.score.matchCount > 0);
  
  // 가중치 점수로 정렬
  const sortedRecipes = filteredRecipes.sort((a, b) => {
    // 먼저 일치하는 재료 수로 정렬
    if (b.score.matchCount !== a.score.matchCount) {
      return b.score.matchCount - a.score.matchCount;
    }
    // 일치하는 재료 수가 같으면 가중치 점수로 정렬
    return b.score.weightedScore - a.score.weightedScore;
  });
  
  return sortedRecipes;
}

// ID로 레시피 가져오기
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getAllRecipes();
  return recipes.find(recipe => recipe.id === id) || null;
}

// 사용자 입력 문자열에서 재료 목록 추출
export function parseUserIngredients(input: string): string[] {
  if (!input) return [];
  
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// 모든 재료 목록 가져오기 (자동완성용)
export async function getAllIngredients(): Promise<IngredientWithCount[]> {
  const recipes = await getAllRecipes();
  
  // 모든 레시피에서 재료를 추출하고 카운트
  const ingredientCounts = new Map<string, number>();
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const trimmedIngredient = ingredient.trim();
      const currentCount = ingredientCounts.get(trimmedIngredient) || 0;
      ingredientCounts.set(trimmedIngredient, currentCount + 1);
    });
  });
  
  // 이름과 카운트를 객체 배열로 변환
  const ingredientsWithCount: IngredientWithCount[] = Array.from(ingredientCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 사용 횟수가 많은 순으로 정렬
  
  return ingredientsWithCount;
} 