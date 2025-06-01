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
  
  // 재료 파싱 함수 - raw_ingredients에서 실제 재료만 추출
  const parseIngredients = (rawIngredients: string): string[] => {
    if (!rawIngredients) return recipe.ingredients.slice(0, 4);
    
    try {
      // 유니코드 제어 문자 정리
      const cleanText = rawIngredients.replace(/\u0007/g, ' ').trim();
      
      // | 로 분리된 재료들 추출
      const ingredients = cleanText.split('|').map(item => {
        const trimmed = item.trim();
        // [재료], [양념] 등의 그룹 라벨 제거
        if (trimmed.startsWith('[') && trimmed.includes(']')) {
          return trimmed.split(']')[1]?.trim() || '';
        }
        
        // 수량 정보 제거하고 재료명만 추출
        const parts = trimmed.split(' ').filter(p => p.trim());
        if (parts.length === 0) return '';
        
        // 숫자나 수량 단위가 포함된 부분 제거
        let ingredientName = '';
        for (const part of parts) {
          // 숫자로 시작하거나 수량 단위가 아닌 경우만 재료명으로 간주
          if (!/^[\d\/]+/.test(part) && !['개', '큰술', '작은술', 'T', 't', 'g', 'ml', 'L', '컵', '숟갈', '스푼'].includes(part)) {
            ingredientName += part + ' ';
          }
        }
        
        return ingredientName.trim();
      }).filter(ingredient => ingredient.length > 0 && ingredient.length < 20); // 너무 긴 것은 제외
      
      return ingredients.slice(0, 4); // 최대 4개만
    } catch {
      return recipe.ingredients.slice(0, 4);
    }
  };
  
  // 파싱된 재료 목록
  const displayIngredients = parseIngredients(recipe.raw_ingredients || '');
  
  // 실제 매칭된 재료 찾기
  const getMatchedIngredients = (): string[] => {
    return userIngredients.filter(userIng => 
      displayIngredients.some(recipeIng => 
        userIng.toLowerCase().includes(recipeIng.toLowerCase()) || 
        recipeIng.toLowerCase().includes(userIng.toLowerCase())
      )
    );
  };
  
  const matchedIngredients = getMatchedIngredients();
  
  return (
    <Link href={`/recipe/${recipe.id}`} className="block group">
      <div className="card overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 transform hover:-translate-y-2">
        {/* 이미지 영역 */}
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
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-full w-full flex items-center justify-center text-gray-400">
              <div className="glass-effect p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* 난이도 배지 */}
          {recipe.difficulty && (
            <div className="absolute top-3 left-3 glass-effect text-xs py-1.5 px-3 rounded-full font-medium text-gray-700 border border-white/30">
              {recipe.difficulty}
            </div>
          )}
          
          {/* AI 추천 점수 배지 */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg">
            {recommendationScore}%
          </div>
        </div>
        
        {/* 컨텐츠 영역 */}
        <div className="p-5 flex-1 flex flex-col">
          {/* 제목 */}
          <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-primary transition-colors text-gray-800 leading-tight">
            {recipe.short_title || recipe.title}
          </h3>
          
          {/* 시간 정보 */}
          {recipe.time && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <div className="w-5 h-5 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">{recipe.time}</span>
            </div>
          )}
          
          {/* 재료 매칭 정보 */}
          <div className="mt-auto space-y-3">
            {/* 매칭된 재료 표시 */}
            {matchedIngredients.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-green-700">일치하는 재료</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    {matchedIngredients.length}개
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {matchedIngredients.map((ingredient, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 rounded-full font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 레시피 재료 미리보기 */}
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">주요 재료</span>
              <div className="flex flex-wrap gap-1">
                {displayIngredients.map((ingredient, index) => {
                  const isMatched = matchedIngredients.some(matched => 
                    matched.toLowerCase().includes(ingredient.toLowerCase()) || 
                    ingredient.toLowerCase().includes(matched.toLowerCase())
                  );
                  
                  return (
                    <span 
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-all ${
                        isMatched 
                          ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30' 
                          : 'bg-gray-100/80 text-gray-600 border border-gray-200/50'
                      }`}
                    >
                      {ingredient}
                    </span>
                  );
                })}
                {recipe.ingredients.length > 4 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200/50">
                    +{recipe.ingredients.length - 4}
                  </span>
                )}
              </div>
            </div>
            
            {/* 통계 정보 */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100/50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {recipe.view_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {recipe.recommend_count || 0}
                </span>
              </div>
              
              {/* 화살표 아이콘 */}
              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <svg className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 