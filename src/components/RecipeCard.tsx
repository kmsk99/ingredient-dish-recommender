import Image from 'next/image';
import Link from 'next/link';

import { RecipeWithScore } from '@/lib/utils';

interface RecipeCardProps {
  recipe: RecipeWithScore;
  userIngredients: string[];
}

export default function RecipeCard({ recipe, userIngredients }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="block">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-48 w-full">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
              이미지 없음
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-lg line-clamp-1 mb-1">{recipe.shortTitle || recipe.title}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-3">{recipe.difficulty || '난이도 정보 없음'}</span>
            {recipe.time && <span>{recipe.time}</span>}
          </div>
          
          <div className="text-sm mb-2">
            <span className="font-medium text-blue-600">
              내 재료 {userIngredients.length}개 중 {recipe.score.matchCount}개 포함
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <span className="mr-2">조회 {recipe.viewCount}</span>
            <span>추천 {recipe.recommendCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 