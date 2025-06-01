'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Recipe } from '@/lib/types';
import { getRecipeById } from '@/lib/utils';

import Loading from './loading';

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

interface ParsedIngredient {
  name: string;
  amount: string;
}

interface IngredientGroup {
  title: string;
  items: ParsedIngredient[];
}

export default function RecipePage({ params }: RecipePageProps) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchRecipe = async () => {
      const recipe = await getRecipeById(id);
      setRecipe(recipe);
    };
    fetchRecipe();
  }, [id]);
  
  if (!recipe) {
    return <Loading />;
  }
  
  // 재료 정보 파싱 (개선된 구현)
  const ingredientGroups: IngredientGroup[] = [];
  
  try {
    if (recipe.raw_ingredients) {
      // 유니코드 제어 문자를 공백으로 변환
      const cleanText = recipe.raw_ingredients.replace(/\u0007/g, ' ').trim();
      
      // 재료 그룹 매칭 - [재료], [양념], [고명] 등으로 시작하는 부분을 찾음
      const groupRegex = /\[([^\]]+)\](.*?)(?=\[[^\]]+\]|$)/g;
      let match;
      
      while ((match = groupRegex.exec(cleanText + ' ')) !== null) {
        const groupTitle = match[1].trim();
        const groupContent = match[2].trim();
        
        // '|'로 구분된 각 재료 항목 파싱
        const items = groupContent.split('|').map((item: string) => {
          const trimmedItem = item.trim();
          if (!trimmedItem) return null;
          
          // 공백으로 단어를 분리
          const parts = trimmedItem.split(' ').filter((p: string) => p.trim());
          
          if (parts.length <= 1) {
            return { name: trimmedItem, amount: '' };
          }
          
          // 숫자(또는 분수)로 시작하는 첫 부분 찾기
          let amountStartIndex = -1;
          for (let i = 0; i < parts.length; i++) {
            // 숫자 또는 분수(1/2 등)로 시작하는지 확인
            if (/^[\d\/]+/.test(parts[i])) {
              amountStartIndex = i;
              break;
            }
          }
          
          // 숫자로 시작하는 부분이 있으면, 그 부분부터 끝까지를 수량으로 처리
          if (amountStartIndex > 0) {
            const name = parts.slice(0, amountStartIndex).join(' ');
            const amount = parts.slice(amountStartIndex).join(' ');
            return { name, amount };
          }
          
          // 숫자로 시작하는 부분이 없거나, 첫 단어부터 숫자면 기존 방식으로 파싱
          const lastIsUnit = isNaN(Number(parts[parts.length - 1]));
          const secondLastIsNumber = !isNaN(Number(parts[parts.length - 2]));
          
          if (parts.length >= 3 && secondLastIsNumber && lastIsUnit) {
            // 수량이 있는 경우 (예: "다진 마늘 1 숟갈")
            const quantity = parts.slice(-2).join(' ');
            const name = parts.slice(0, -2).join(' ');
            return { name, amount: quantity };
          } else if (parts.length >= 2 && !isNaN(Number(parts[parts.length - 1]))) {
            // 단위 없는 수량만 있는 경우 (예: "계란 2")
            const quantity = parts[parts.length - 1];
            const name = parts.slice(0, -1).join(' ');
            return { name, amount: quantity };
          } else {
            // 수량을 파싱할 수 없는 경우
            return { name: trimmedItem, amount: '' };
          }
        }).filter(Boolean) as ParsedIngredient[];
        
        if (items.length > 0) {
          ingredientGroups.push({ title: groupTitle, items });
        }
      }
      
      // 그룹 매칭이 없는 경우, 전체를 하나의 그룹으로 처리
      if (ingredientGroups.length === 0) {
        const items = cleanText.split('|').map((item: string) => {
          const trimmedItem = item.trim();
          if (!trimmedItem) return null;
          
          // 위와 동일한 로직으로 재료명과 수량 분리
          const parts = trimmedItem.split(' ').filter((p: string) => p.trim());
          
          if (parts.length <= 1) {
            return { name: trimmedItem, amount: '' };
          }
          
          // 숫자(또는 분수)로 시작하는 첫 부분 찾기
          let amountStartIndex = -1;
          for (let i = 0; i < parts.length; i++) {
            // 숫자 또는 분수(1/2 등)로 시작하는지 확인
            if (/^[\d\/]+/.test(parts[i])) {
              amountStartIndex = i;
              break;
            }
          }
          
          // 숫자로 시작하는 부분이 있으면, 그 부분부터 끝까지를 수량으로 처리
          if (amountStartIndex > 0) {
            const name = parts.slice(0, amountStartIndex).join(' ');
            const amount = parts.slice(amountStartIndex).join(' ');
            return { name, amount };
          }
          
          const lastIsUnit = isNaN(Number(parts[parts.length - 1]));
          const secondLastIsNumber = !isNaN(Number(parts[parts.length - 2]));
          
          if (parts.length >= 3 && secondLastIsNumber && lastIsUnit) {
            // 수량이 있는 경우 (예: "다진 마늘 1 숟갈")
            const quantity = parts.slice(-2).join(' ');
            const name = parts.slice(0, -2).join(' ');
            return { name, amount: quantity };
          } else if (parts.length >= 2 && !isNaN(Number(parts[parts.length - 1]))) {
            // 단위 없는 수량만 있는 경우 (예: "계란 2")
            const quantity = parts[parts.length - 1];
            const name = parts.slice(0, -1).join(' ');
            return { name, amount: quantity };
          } else {
            return { name: trimmedItem, amount: '' };
          }
        }).filter(Boolean) as ParsedIngredient[];
        
        if (items.length > 0) {
          ingredientGroups.push({ title: '재료', items });
        }
      }
    }
  } catch (error) {
    console.error('재료 정보 파싱 오류:', error);
    
    // 파싱에 실패한 경우 단순 목록으로 대체
    if (recipe.ingredients.length > 0) {
      ingredientGroups.push({
        title: '재료',
        items: recipe.ingredients.map((name: string) => ({ name, amount: '' }))
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션과 장식 요소 */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* 떠다니는 장식 요소들 */}
      <div className="absolute top-20 right-10 opacity-5 text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        👨‍🍳
      </div>
      <div className="absolute top-60 left-10 opacity-5 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        📖
      </div>
      <div className="absolute bottom-40 right-20 opacity-5 text-7xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
        🍽️
      </div>
      <div className="absolute bottom-20 left-16 opacity-5 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
        ⭐
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* 뒤로가기 버튼 */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-xl border border-white/30 text-gray-700 hover:text-primary transition-all duration-300 mb-6 hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          결과 목록으로 돌아가기
        </button>
        
        {/* 레시피 메인 카드 */}
        <article className="card overflow-hidden mb-8">
          {/* 이미지 영역 */}
          {recipe.image_url && (
            <div className="relative h-80 md:h-96 w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
              />
              {/* 제목 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-xl">🍳</span>
                  </div>
                  <div className="glass-effect px-3 py-1 rounded-full border border-white/30">
                    <span className="text-white text-sm font-medium">레시피</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {recipe.title}
                </h1>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{recipe.time || '조리 시간'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{recipe.servings || '인분'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 이미지가 없는 경우의 제목 */}
          {!recipe.image_url && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🍳
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {recipe.title}
                  </h1>
                  <p className="text-gray-600">맛있는 요리 레시피</p>
                </div>
              </div>
            </div>
          )}

          {/* 재료 섹션 */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                🥬
              </div>
              <h2 className="text-xl font-bold text-gray-800">재료</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ingredientGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <h3 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {groupIndex + 1}
                    </span>
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center py-3 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/80 hover:bg-white/80 hover:border-primary/20 transition-all duration-200">
                        <span className="text-gray-800 font-medium">{ingredient.name}</span>
                        {ingredient.amount && (
                          <span className="text-primary font-semibold text-sm bg-primary/8 px-3 py-1.5 rounded-full border border-primary/15">
                            {ingredient.amount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 재료가 없는 경우 */}
            {ingredientGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📝</div>
                <p>재료 정보가 없습니다</p>
              </div>
            )}
          </div>
        </article>

        {/* 조리법 섹션 */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-lg flex items-center justify-center">
                👨‍🍳
              </div>
              <h2 className="text-xl font-bold text-gray-800">조리법</h2>
            </div>

            <div className="text-center py-8">
              <div className="glass-effect p-6 rounded-2xl border border-white/30 max-w-md mx-auto">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">상세 조리법 확인하기</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  완전한 조리법과 단계별 과정은<br />
                  만개의 레시피에서 확인하실 수 있습니다
                </p>
                <a
                  href={`https://www.10000recipe.com/recipe/${recipe.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  만개의 레시피에서 보기
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <div className="glass-effect p-4 rounded-xl border border-white/30 inline-block">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">출처:</span> 만개의 레시피
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 