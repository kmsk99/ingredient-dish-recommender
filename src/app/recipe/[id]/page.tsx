import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getRecipeById } from '@/lib/utils';

interface RecipePageProps {
  params: { id: string };
}

interface ParsedIngredient {
  name: string;
  amount: string;
}

interface IngredientGroup {
  title: string;
  items: ParsedIngredient[];
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipeById(params.id);
  
  if (!recipe) {
    notFound();
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/results" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 결과 목록으로 돌아가기
        </Link>
        
        <article className="mt-6">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-2">
            {recipe.difficulty && (
              <span className="bg-gray-100 px-2 py-1 rounded">{recipe.difficulty}</span>
            )}
            {recipe.time && (
              <span className="bg-gray-100 px-2 py-1 rounded">{recipe.time}</span>
            )}
            {recipe.servings && (
              <span className="bg-gray-100 px-2 py-1 rounded">{recipe.servings}</span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
            <span>조회 {recipe.viewCount}</span>
            <span>추천 {recipe.recommendCount}</span>
            <span>스크랩 {recipe.scrapCount}</span>
          </div>
          
          {recipe.description && (
            <p className="mt-6 text-gray-700">{recipe.description}</p>
          )}
          
          {recipe.imageUrl && (
            <div className="mt-6 relative h-80 w-full md:h-96 rounded-lg overflow-hidden">
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                className="object-cover"
              />
            </div>
          )}
          
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-3">재료</h2>
            
            {ingredientGroups.length > 0 ? (
              ingredientGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  {ingredientGroups.length > 1 && (
                    <h3 className="font-medium text-lg mb-2">{group.title}</h3>
                  )}
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.items.map((ingredient, index) => (
                      <li key={index} className="flex justify-between py-1 border-b">
                        <span>{ingredient.name}</span>
                        {ingredient.amount && (
                          <span className="text-gray-600">{ingredient.amount}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-600">재료 정보가 없습니다.</p>
            )}
          </section>
          
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-3">만드는 법</h2>
            <div className="flex flex-col gap-4">
              <a
                href={`https://www.10000recipe.com/recipe/${recipe.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors w-full md:w-auto"
              >
                만개의 레시피에서 상세 조리법 보기
              </a>
              <p className="text-gray-600 text-sm">
                상세 조리법은 만개의 레시피 웹사이트에서 확인하실 수 있습니다.
              </p>
            </div>
          </section>
        </article>
      </main>
      
      <Footer />
    </div>
  );
} 