import Image from 'next/image';
import Link from 'next/link';

import { RecipeWithScore } from '@/lib/types';

interface RecipeCardProps {
  recipe: RecipeWithScore;
  userIngredients: string[];
}

export default function RecipeCard({ recipe, userIngredients }: RecipeCardProps) {
  // AI 추천 점수 (임베딩 기반 유사도 점수)
  const recommendationScore = recipe.score.similarity 
    ? Math.round(recipe.score.similarity * 100) 
    : Math.round(recipe.score.weightedScore * 100);
  
  // 재료 일치 개수
  const matchedIngredientsCount = recipe.score.matchCount;
  
  return (
    <Link href={`/recipe/${recipe.id}`} className="block group">
      <div className="recipe-card bg-white rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300">
        <div className="relative h-48 w-full overflow-hidden">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="bg-gray-100 h-full w-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {recipe.difficulty && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs py-1 px-3 rounded-full font-medium text-gray-700 shadow-sm">
              {recipe.difficulty}
            </div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {recipe.short_title || recipe.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            {recipe.time && (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.time}
              </span>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">AI 추천 점수:</span>
                <div className="py-1 px-3 bg-primary/10 inline-block rounded-full">
                  <span className="font-bold text-primary">
                    {recommendationScore}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">일치 재료 수:</span>
                <div className="py-1 px-3 bg-secondary/10 inline-block rounded-full">
                  <span className="font-bold text-secondary">
                    {matchedIngredientsCount}개 재료
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {recipe.view_count}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {recipe.recommend_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 