'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { IngredientWithCount } from '@/lib/types';

export default function IngredientInput() {
  const [inputValue, setInputValue] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<IngredientWithCount[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 클릭 이벤트 처리
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색어에 따라 API에서 재료 추천 목록 가져오기
  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
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
      
      setSuggestions(data.filter((item: IngredientWithCount) => 
        !selectedIngredients.includes(item.name)
      ));
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('재료 추천 가져오기 오류:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 입력 변경 처리 (자동완성)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 검색어가 1글자 이상일 때 API 호출
    if (value.trim().length > 0) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 첫 번째 제안 선택 또는 직접 입력 처리
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else if (inputValue.trim()) {
        // 직접 입력한 경우도 추가
        if (!selectedIngredients.includes(inputValue.trim())) {
          setSelectedIngredients([...selectedIngredients, inputValue.trim()]);
        }
        setInputValue('');
      }
      setShowSuggestions(false);
    }
  };

  // 자동완성 클릭 처리
  const handleSuggestionClick = (suggestion: IngredientWithCount) => {
    if (!selectedIngredients.includes(suggestion.name)) {
      setSelectedIngredients([...selectedIngredients, suggestion.name]);
    }
    setInputValue(''); // 입력 필드 비우기
    setSuggestions([]); // 제안 목록 숨기기
    setShowSuggestions(false);
    setTimeout(() => inputRef.current?.focus(), 0); // 포커스 유지
  };

  // 선택된 재료 삭제 처리
  const handleRemoveIngredient = (indexToRemove: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, index) => index !== indexToRemove));
  };

  // 추천 받기 버튼 클릭 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedIngredients.length === 0) return;

    // 선택된 재료 이름을 쉼표로 구분하여 쿼리 파라미터 생성
    const ingredientsQuery = encodeURIComponent(selectedIngredients.join(','));
    // 결과 페이지로 이동
    router.push(`/results?ingredients=${ingredientsQuery}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 space-y-6">
      {/* 재료 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col relative bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <label htmlFor="ingredients" className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
            <span className="mr-2">🌿</span> 재료 선택
          </label>

          {/* 선택된 재료 목록 UI */}
          {selectedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedIngredients.map((ingredient, index) => (
                <div key={index} className="bg-green-100 text-green-800 text-sm py-1.5 px-3 rounded-full flex items-center">
                  <span>{ingredient}</span>
                  <button type="button" onClick={() => handleRemoveIngredient(index)} className="ml-2 text-green-600 hover:text-green-800 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 재료 검색 및 자동완성 입력 필드 */}
          <div className="relative">
            <input
              id="ingredients"
              type="text"
              placeholder="재료 검색 (예: 돼지고기, 김치, 두부)"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (inputValue.trim()) setShowSuggestions(true); }}
              ref={inputRef}
              className="p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
              autoComplete="off"
            />
            

            {/* 로딩 인디케이터 */}
            {loadingSuggestions && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">로딩 중...</span>}

            {/* 자동완성 목록 */}
            {showSuggestions && (
              <div ref={suggestionRef} className="absolute z-10 w-full bg-white mt-1 border rounded-xl shadow-lg overflow-hidden top-[100%] max-h-60 overflow-y-auto">
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <span className="font-medium">{suggestion.name}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{suggestion.count}개 레시피</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-gray-500 text-sm">일치하는 재료가 없습니다</div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-1">
            데이터베이스에 있는 재료를 검색하거나 직접 입력할 수 있습니다.
          </p>
        </div>

        {/* 추천 받기 버튼 */}
        <button 
          type="submit" 
          disabled={selectedIngredients.length === 0} 
          className={`p-3 rounded-xl font-medium text-white ${selectedIngredients.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          레시피 추천받기
        </button>
      </form>
    </div>
  );
} 