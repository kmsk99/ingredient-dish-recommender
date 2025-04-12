'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';
import {
  getAllIngredients,
  getRecommendedRecipes,
  IngredientWithCount,
  parseUserIngredients,
  RecipeWithScore,
} from '@/lib/utils';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 자동완성 관련 상태
  const [suggestions, setSuggestions] = useState<IngredientWithCount[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientWithCount[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
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
  
  // 모든 재료 목록 가져오기
  useEffect(() => {
    async function fetchIngredients() {
      try {
        setLoadingIngredients(true);
        const data = await getAllIngredients();
        setAllIngredients(data);
        setLoadingIngredients(false);
      } catch (error) {
        console.error('재료 목록을 가져오는 중 오류 발생:', error);
        setLoadingIngredients(false);
      }
    }

    fetchIngredients();
  }, []);
  
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

    if (value.trim().length > 0) {
      const filtered = allIngredients
        .filter(ingredient => 
          ingredient.name.toLowerCase().includes(value.toLowerCase()) &&
          !ingredients.includes(ingredient.name)
        )
        .slice(0, 5); // 최대 5개 제안만 표시
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      if (!ingredients.includes(inputValue.trim())) {
        const newIngredients = [...ingredients, inputValue.trim()];
        setIngredients(newIngredients);
        
        // URL 업데이트 및 레시피 다시 검색
        updateIngredientsAndSearch(newIngredients);
      }
      
      setInputValue('');
      setShowSuggestions(false);
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
    
    // 입력 필드에 포커스 유지
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const updateIngredientsAndSearch = (newIngredients: string[]) => {
    if (newIngredients.length > 0) {
      const query = encodeURIComponent(newIngredients.join(', '));
      router.push(`/results?ingredients=${query}`);
    } else {
      router.push('/results');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary hover:text-primary-hover mb-4 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            처음으로 돌아가기
          </Link>
          
          <h2 className="text-2xl font-bold mt-6 text-primary">추천 레시피</h2>
          
          <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">입력 재료:</span> 
                {ingredients.length === 0 && (
                  <span className="text-gray-500 ml-2">재료가 입력되지 않았습니다.</span>
                )}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {ingredients.map((ingredient, idx) => (
                  <div 
                    key={idx} 
                    className="bg-primary bg-opacity-10 text-primary text-sm py-1 px-3 rounded-full flex items-center"
                  >
                    <span>{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="ml-2 text-primary hover:text-primary-hover focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center mt-2 relative">
                <input
                  type="text"
                  placeholder="재료 추가하기"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary flex-grow"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
                      const newIngredients = [...ingredients, inputValue.trim()];
                      setIngredients(newIngredients);
                      updateIngredientsAndSearch(newIngredients);
                      setInputValue('');
                    }
                  }}
                  className="ml-2 bg-primary hover:bg-primary-hover text-white text-sm py-2 px-3 rounded-lg"
                >
                  추가
                </button>
                
                {/* 자동완성 목록 */}
                {showSuggestions && (
                  <div 
                    ref={suggestionRef}
                    className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-lg top-[40px] left-0 overflow-hidden"
                  >
                    {loadingIngredients ? (
                      <div className="p-3 text-gray-500 text-sm">로딩 중...</div>
                    ) : suggestions.length > 0 ? (
                      <ul>
                        {suggestions.map((suggestion, index) => (
                          <li 
                            key={index} 
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 hover:bg-gray-50 cursor-pointer text-sm flex justify-between items-center border-b last:border-b-0 border-gray-100"
                          >
                            <span className="font-medium">{suggestion.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {suggestion.count}개 레시피
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-gray-500 text-sm">일치하는 재료가 없습니다</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} userIngredients={ingredients} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mt-4">추천할 레시피가 없습니다.</p>
                <p className="mt-2 text-gray-500">다른 재료를 입력해보세요.</p>
                <Link 
                  href="/" 
                  className="mt-6 inline-flex items-center bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                >
                  다시 시도하기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
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