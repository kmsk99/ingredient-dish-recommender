'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { IngredientWithCount } from '@/lib/utils';

export default function IngredientInput() {
  const [inputValue, setInputValue] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<IngredientWithCount[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientWithCount[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 모든 재료 목록 가져오기
  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await fetch('/api/ingredients');
        const data = await response.json();
        setAllIngredients(data);
        setLoading(false);
      } catch (error) {
        console.error('재료 목록을 가져오는 중 오류 발생:', error);
        setLoading(false);
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

  // 입력에 따라 자동완성 목록 필터링
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim().length > 0) {
      const filtered = allIngredients
        .filter(ingredient => 
          ingredient.name.toLowerCase().includes(value.toLowerCase()) &&
          !selectedIngredients.includes(ingredient.name)
        )
        .slice(0, 5); // 최대 5개 제안만 표시
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      if (!selectedIngredients.includes(inputValue.trim())) {
        setSelectedIngredients([...selectedIngredients, inputValue.trim()]);
      }
      
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // 자동완성 선택 처리
  const handleSuggestionClick = (suggestion: IngredientWithCount) => {
    if (!selectedIngredients.includes(suggestion.name)) {
      setSelectedIngredients([...selectedIngredients, suggestion.name]);
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

  // 재료 삭제 처리
  const handleRemoveIngredient = (indexToRemove: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedIngredients.length === 0) return;
    
    // 재료를 쿼리 파라미터로 넘겨서 결과 페이지로 이동
    const query = encodeURIComponent(selectedIngredients.join(', '));
    router.push(`/results?ingredients=${query}`);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col relative bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label htmlFor="ingredients" className="text-sm font-semibold mb-2 text-gray-700">
            재료 입력
          </label>
          
          {/* 선택된 재료 목록 */}
          {selectedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedIngredients.map((ingredient, index) => (
                <div 
                  key={index} 
                  className="bg-primary bg-opacity-10 text-primary text-sm py-1 px-3 rounded-full flex items-center"
                >
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="ml-2 text-primary hover:text-primary-hover focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <input
            id="ingredients"
            type="text"
            placeholder="예: 돼지고기, 김치, 두부"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-2">
            재료를 입력하고 엔터키를 누르세요
          </p>
          
          {/* 자동완성 목록 */}
          {showSuggestions && (
            <div 
              ref={suggestionRef}
              className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-lg top-[100px] overflow-hidden"
              style={{ top: selectedIngredients.length > 0 ? 'auto' : '100px' }}
            >
              {loading ? (
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

        <button
          type="submit"
          disabled={selectedIngredients.length === 0}
          className={`${
            selectedIngredients.length === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-hover'
          } text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center`}
        >
          <span>추천받기</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
} 