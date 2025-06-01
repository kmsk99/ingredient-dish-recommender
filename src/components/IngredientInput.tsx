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
  const [noMatchMessage, setNoMatchMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
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
        !selectedIngredients.includes(item.name)
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

  // 한글 조합 시작
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 한글 조합 업데이트
  const handleCompositionUpdate = () => {
    setIsComposing(true);
  };

  // 한글 조합 종료
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    // 조합 종료 후 검색 실행
    const value = e.currentTarget.value;
    if (value.trim().length > 0) {
      fetchSuggestions(value);
    }
  };

  // 입력 변경 처리 (자동완성) - 조합 중이 아닐 때만 검색
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 한글 조합 중이 아닐 때만 API 호출
    if (!isComposing && value.trim().length > 0) {
      fetchSuggestions(value);
    } else if (!isComposing && value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoMatchMessage('');
    }
  };

  // 엔터키 처리 - 한글 조합 중이 아닐 때만 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
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

  // 자동완성 클릭 처리
  const handleSuggestionClick = (suggestion: IngredientWithCount) => {
    if (!selectedIngredients.includes(suggestion.name)) {
      setSelectedIngredients([...selectedIngredients, suggestion.name]);
    }
    setInputValue(''); // 입력 필드 비우기
    setSuggestions([]); // 제안 목록 숨기기
    setShowSuggestions(false);
    setNoMatchMessage('');
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
    <div className="w-full mx-auto space-y-6">
      {/* 재료 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6 p-6 pb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-hover rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              🌿
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">재료 선택</h2>
              <p className="text-xs text-gray-500">DB에 등록된 재료를 검색해서 선택해주세요</p>
            </div>
          </div>

          {/* 선택된 재료 목록 UI */}
          {selectedIngredients.length > 0 && (
            <div className="px-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">선택된 재료</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {selectedIngredients.length}개
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-tag group flex items-center gap-2 text-sm">
                    <span>{ingredient}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveIngredient(index)}
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

          {/* 재료 검색 입력 필드 */}
          <div className="px-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="ingredients"
                type="text"
                placeholder="재료 이름으로 검색하세요 (예: 돼지고기, 두부)"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (inputValue.trim()) setShowSuggestions(true); }}
                onCompositionStart={handleCompositionStart}
                onCompositionUpdate={handleCompositionUpdate}
                onCompositionEnd={handleCompositionEnd}
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
          </div>

          {/* 경고 메시지 */}
          {noMatchMessage && (
            <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
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
              className="mx-6 mt-3 bg-white/95 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-gray-200/50 transition-all duration-300 ease-in-out transform"
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
          <div className="p-6 pt-3 flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>검색 목록에서 선택하면 재료가 추가됩니다</span>
          </div>
        </div>

        {/* 추천 받기 버튼 */}
        <button 
          type="submit" 
          disabled={selectedIngredients.length === 0} 
          className={`
            w-full py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 relative overflow-hidden
            ${selectedIngredients.length === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary-hover hover:to-accent shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            }
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {selectedIngredients.length === 0 
              ? '재료를 선택해주세요' 
              : `${selectedIngredients.length}개 재료로 레시피 찾기`
            }
          </span>
        </button>
      </form>
    </div>
  );
} 