'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';
import {
  IngredientWithCount,
  parseUserIngredients,
  RecipeWithScore,
} from '@/lib/types';
import { getRecommendedRecipes } from '@/lib/utils';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 자동완성 관련 상태
  const [suggestions, setSuggestions] = useState<IngredientWithCount[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [noMatchMessage, setNoMatchMessage] = useState('');
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      const ingredientsParam = searchParams.get('ingredients') || '';
      const parsedIngredients = parseUserIngredients(decodeURIComponent(ingredientsParam));
      setIngredients(parsedIngredients);
      
      if (parsedIngredients.length > 0) {
        const recommendedRecipes = await getRecommendedRecipes(parsedIngredients);
        setRecipes(recommendedRecipes);
      } else {
        setRecipes([]);
      }
      setIsLoading(false);
    };

    fetchRecipes();
  }, [searchParams]);
  
  // 클릭 이벤트 처리를 위한 useEffect
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 검색어에 따라 API에서 재료 추천 목록 가져오기
  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoMatchMessage('');
      return;
    }

    setLoadingSuggestions(true);
    try {
      // 클라이언트 함수 사용으로 변경
      const { searchIngredients } = await import('@/lib/ingredient-utils');
      const data = await searchIngredients({
        search: searchTerm,
        limit: 5 // 최대 5개 추천만 가져오기
      });
      
      const filteredData = data.filter((item: IngredientWithCount) => 
        !ingredients.includes(item.name)
      );
      
      setSuggestions(filteredData);
      setShowSuggestions(true);
      
      if (filteredData.length === 0) {
        setNoMatchMessage('DB에 등록된 재료가 없습니다. 다른 검색어를 시도해보세요.');
      } else {
        setNoMatchMessage('');
      }
    } catch (error) {
      console.error('재료 추천 가져오기 오류:', error);
      setSuggestions([]);
      setShowSuggestions(true);
      setNoMatchMessage('재료 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    const newIngredients = ingredients.filter((_, index) => index !== indexToRemove);
    setIngredients(newIngredients);
    
    // URL 업데이트 및 레시피 다시 검색
    updateIngredientsAndSearch(newIngredients);
  };
  
  // 입력에 따라 자동완성 목록 필터링
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 검색어가 1글자 이상일 때 API 호출
    if (value.trim().length > 0) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoMatchMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 첫 번째 제안이 있는 경우에만 선택
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else {
        // DB에 없는 재료일 경우 경고 메시지 표시
        setNoMatchMessage('DB에 등록된 재료만 선택할 수 있습니다. 목록에서 선택해주세요.');
        setTimeout(() => setNoMatchMessage(''), 3000);
      }
    }
  };
  
  // 자동완성 선택 처리
  const handleSuggestionClick = (suggestion: IngredientWithCount) => {
    if (!ingredients.includes(suggestion.name)) {
      const newIngredients = [...ingredients, suggestion.name];
      setIngredients(newIngredients);
      updateIngredientsAndSearch(newIngredients);
    }
    
    setInputValue('');
    setShowSuggestions(false);
    setNoMatchMessage('');
    
    // 입력 필드에 포커스 유지
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const updateIngredientsAndSearch = (newIngredients: string[]) => {
    if (newIngredients.length > 0) {
      const query = encodeURIComponent(newIngredients.join(','));
      router.push(`/results?ingredients=${query}`);
    } else {
      router.push('/results');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션과 장식 요소 */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* 떠다니는 장식 요소들 */}
      <div className="absolute top-20 right-10 opacity-5 text-7xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        🍽️
      </div>
      <div className="absolute top-60 left-10 opacity-5 text-6xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        🥘
      </div>
      <div className="absolute bottom-40 right-20 opacity-5 text-8xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
        👨‍🍳
      </div>
      <div className="absolute bottom-20 left-16 opacity-5 text-5xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
        🔍
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* 뒤로가기 및 페이지 제목 */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-xl border border-white/30 text-gray-700 hover:text-primary transition-all duration-300 mb-6 hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            처음으로 돌아가기
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              🔍
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">맞춤형 레시피</h1>
              <p className="text-sm text-gray-600">선택한 재료로 만들 수 있는 요리들</p>
            </div>
          </div>
          
          {/* 재료 관리 카드 */}
          <div className="card mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                  🌿
                </div>
                <h3 className="text-lg font-semibold text-gray-800">재료 관리</h3>
              </div>
              
              {/* 선택된 재료 목록 */}
              {ingredients.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">선택된 재료</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {ingredients.length}개
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, idx) => (
                      <div key={idx} className="ingredient-tag group flex items-center gap-2 text-sm">
                        <span>{ingredient}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all"
                          aria-label={`${ingredient} 삭제`}
                        >
                          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 재료 검색 입력 */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="재료 추가하기 (DB에서 검색)"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (inputValue.trim()) setShowSuggestions(true); }}
                  ref={inputRef}
                  className="w-full pl-10 pr-10 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                  autoComplete="off"
                />
                
                {/* 로딩 인디케이터 */}
                {loadingSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* 경고 메시지 */}
              {noMatchMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {noMatchMessage}
                  </p>
                </div>
              )}

              {/* 자동완성 목록 - Block 요소로 변경 */}
              {showSuggestions && (
                <div 
                  ref={suggestionRef} 
                  className="mt-3 bg-white/95 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-gray-200/50 transition-all duration-300 ease-in-out transform"
                >
                  {suggestions.length > 0 ? (
                    <ul className="divide-y divide-gray-100/50">
                      {suggestions.map((suggestion, index) => (
                        <li 
                          key={index} 
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-3 hover:bg-primary/5 cursor-pointer transition-all duration-200 flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                              🥬
                            </div>
                            <span className="font-medium text-gray-800 text-sm group-hover:text-primary transition-colors">{suggestion.name}</span>
                          </div>
                          <span className="text-xs bg-gradient-to-r from-secondary to-primary text-white px-2 py-1 rounded-full font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                            {suggestion.count}개
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        🔍
                      </div>
                      <p className="text-gray-500 text-xs">DB에서 일치하는 재료가 없습니다</p>
                      <p className="text-gray-400 text-xs mt-1">다른 검색어를 시도해보세요</p>
                    </div>
                  )}
                </div>
              )}

              {/* 도움말 텍스트 */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>검색 목록에서 선택하면 재료가 추가되고 레시피가 다시 검색됩니다</span>
              </div>
            </div>
          </div>
        </div>

        {/* 레시피 결과 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🍳</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">레시피를 찾고 있어요...</p>
          </div>
        ) : (
          <>
            {recipes.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-full border border-white/30">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium text-gray-700">총 {recipes.length}개의 레시피를 찾았어요</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} userIngredients={ingredients} />
                  ))}
                </div>
              </>
            ) : (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">😔</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  추천할 레시피가 없어요
                </h3>
                <p className="text-gray-600 mb-6">
                  다른 재료를 입력해보시거나<br />
                  더 많은 재료를 입력해보세요
                </p>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  다시 시도하기
                </Link>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 