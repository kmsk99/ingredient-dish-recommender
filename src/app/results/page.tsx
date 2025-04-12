import Link from 'next/link';
import { Suspense } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';
import {
  getRecommendedRecipes,
  parseUserIngredients,
  RecipeWithScore,
} from '@/lib/utils';

interface ResultsPageProps {
  searchParams: { ingredients?: string };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const ingredientsParam = searchParams.ingredients || '';
  const ingredients = parseUserIngredients(decodeURIComponent(ingredientsParam));
  
  let recipes: RecipeWithScore[] = [];
  if (ingredients.length > 0) {
    recipes = await getRecommendedRecipes(ingredients);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 처음으로 돌아가기
          </Link>
          
          <h2 className="text-2xl font-bold mt-4">추천 레시피</h2>
          <p className="text-gray-600 mt-1">
            입력 재료: {ingredients.length > 0 ? ingredients.join(', ') : '재료가 입력되지 않았습니다.'}
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-10">로딩 중...</div>}>
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} userIngredients={ingredients} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">추천할 레시피가 없습니다.</p>
              <p className="mt-2">다른 재료를 입력해보세요.</p>
              <Link href="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                다시 시도하기
              </Link>
            </div>
          )}
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
} 