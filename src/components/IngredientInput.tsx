'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { IngredientWithCount } from '@/lib/utils';

export default function IngredientInput() {
  const [ingredients, setIngredients] = useState('');
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
    setIngredients(value);

    const inputs = value.split(',');
    const currentInputValue = inputs[inputs.length - 1].trim().toLowerCase();

    if (currentInputValue.length > 0) {
      const filtered = allIngredients
        .filter(ingredient => 
          ingredient.name.toLowerCase().includes(currentInputValue)
        )
        .slice(0, 5); // 최대 5개 제안만 표시
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 자동완성 선택 처리
  const handleSuggestionClick = (suggestion: IngredientWithCount) => {
    const inputs = ingredients.split(',');
    inputs.pop(); // 현재 입력 중인 재료 제거
    
    const newValue = inputs.length > 0 
      ? inputs.join(',') + ', ' + suggestion.name + ', '
      : suggestion.name + ', ';
    
    setIngredients(newValue);
    setShowSuggestions(false);
    
    // 입력 필드에 포커스 유지
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    
    // 재료를 쿼리 파라미터로 넘겨서 결과 페이지로 이동
    const query = encodeURIComponent(ingredients.trim());
    router.push(`/results?ingredients=${query}`);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col relative">
          <label htmlFor="ingredients" className="text-sm font-medium mb-1">
            재료 입력
          </label>
          <input
            id="ingredients"
            type="text"
            placeholder="예: 돼지고기, 김치, 두부"
            value={ingredients}
            onChange={handleInputChange}
            ref={inputRef}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            재료는 쉼표(,)로 구분해주세요
          </p>
          
          {/* 자동완성 목록 */}
          {showSuggestions && (
            <div 
              ref={suggestionRef}
              className="absolute z-10 w-full bg-white mt-1 border rounded-md shadow-lg top-[72px]"
            >
              {loading ? (
                <div className="p-2 text-gray-500 text-sm">로딩 중...</div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between items-center"
                    >
                      <span>{suggestion.name}</span>
                      <span className="text-xs text-gray-500">{suggestion.count}개 레시피</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-2 text-gray-500 text-sm">일치하는 재료가 없습니다</div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          추천받기
        </button>
      </form>
    </div>
  );
} 