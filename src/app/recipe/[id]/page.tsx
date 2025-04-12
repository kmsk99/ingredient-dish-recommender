'use client'

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getRecipeById, Recipe } from '@/lib/utils';

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

  // 디버깅을 위한 콘솔 로그 추가
  console.log(`레시피 ID: ${id} 조회 시도`);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      const recipe = await getRecipeById(id);
      setRecipe(recipe);
    };
    fetchRecipe();
  }, [id]);
  
  // 디버깅을 위한 콘솔 로그 추가
  console.log(`레시피 결과:`, recipe ? '데이터 있음' : '데이터 없음');
  
  if (!recipe) {
    console.error(`레시피 ID ${id}를 찾을 수 없습니다.`);
    return <Loading />;
  }
  
  // 재료 정보 파싱 (개선된 구현)
  const ingredientGroups: IngredientGroup[] = [];
  
  try {
    if (recipe.rawIngredients) {
      // 유니코드 제어 문자를 공백으로 변환
      const cleanText = recipe.rawIngredients.replace(/\u0007/g, ' ').trim();
      
      // 재료 그룹 매칭 - [재료], [양념], [고명] 등으로 시작하는 부분을 찾음
      const groupRegex = /\[([^\]]+)\](.*?)(?=\[[^\]]+\]|$)/g;
      let match;
      
      while ((match = groupRegex.exec(cleanText + ' ')) !== null) {
        const groupTitle = match[1].trim();
        const groupContent = match[2].trim();
        
        // '|'로 구분된 각 재료 항목 파싱
        const items = groupContent.split('|').map(item => {
          const trimmedItem = item.trim();
          if (!trimmedItem) return null;
          
          // 공백으로 단어를 분리
          const parts = trimmedItem.split(' ').filter(p => p.trim());
          
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
        const items = cleanText.split('|').map(item => {
          const trimmedItem = item.trim();
          if (!trimmedItem) return null;
          
          // 위와 동일한 로직으로 재료명과 수량 분리
          const parts = trimmedItem.split(' ').filter(p => p.trim());
          
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
        items: recipe.ingredients.map(name => ({ name, amount: '' }))
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link 
          href="/results" 
          className="inline-flex items-center text-primary hover:text-primary-hover mb-6 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          결과 목록으로 돌아가기
        </Link>
        
        <article className="bg-white rounded-2xl overflow-hidden shadow-md">
          {recipe.imageUrl && (
            <div className="relative h-80 md:h-96 w-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{recipe.title}</h1>
                
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {recipe.difficulty && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {recipe.difficulty}
                    </span>
                  )}
                  {recipe.time && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {recipe.time}
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {recipe.servings}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            {!recipe.imageUrl && (
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{recipe.title}</h1>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-4">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {recipe.viewCount}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {recipe.recommendCount}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {recipe.scrapCount}
              </span>
            </div>
            
            {recipe.description && (
              <div className="mt-6">
                <p className="text-gray-700 bg-secondary/5 p-4 rounded-xl border border-secondary/10 leading-relaxed">{recipe.description}</p>
              </div>
            )}
            
            <section className="mt-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-primary mr-2">🥕</span>
                <span>재료</span>
              </h2>
              
              {ingredientGroups.length > 0 ? (
                ingredientGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    {ingredientGroups.length > 1 && (
                      <h3 className="font-semibold text-lg mb-3 text-gray-700 border-l-4 border-primary pl-3">{group.title}</h3>
                    )}
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((ingredient, index) => (
                        <li key={index} className="flex justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                          <span className="font-medium text-gray-800">{ingredient.name}</span>
                          {ingredient.amount && (
                            <span className="text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200 text-sm">{ingredient.amount}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">재료 정보가 없습니다.</p>
              )}
            </section>
            
            <section className="mt-10">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-primary mr-2">👨‍🍳</span>
                <span>만드는 법</span>
              </h2>
              <div className="flex flex-col gap-4 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-gray-100">
                <a
                  href={`https://www.10000recipe.com/recipe/${recipe.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-colors w-full md:w-auto mx-auto shadow-md"
                >
                  <span className='text-white'>만개의 레시피에서 상세 조리법 보기</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="text-gray-600 text-sm text-center">
                  상세 조리법은 만개의 레시피 웹사이트에서 확인하실 수 있습니다.
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
} 