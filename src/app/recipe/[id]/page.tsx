import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getRecipeById } from '@/lib/utils';

interface RecipePageProps {
  params: { id: string };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipeById(params.id);
  
  if (!recipe) {
    notFound();
  }
  
  // 재료 정보 파싱 (간단한 구현)
  let ingredients: { name: string; amount: string }[] = [];
  try {
    // 예: "[재료] 돼지고기\u0007500\u0007g\u0007| 된장\u00071.5\u0007큰술\u0007"
    const rawIngredientsText = recipe.rawIngredients;
    const matches = rawIngredientsText.matchAll(/([^|\u0007]+)\u0007([^|\u0007]*)\u0007([^|\u0007]*)\u0007\|?/g);
    
    for (const match of matches) {
      if (match[1].trim()) {
        ingredients.push({
          name: match[1].trim(),
          amount: `${match[2] || ''} ${match[3] || ''}`.trim(),
        });
      }
    }
  } catch (error) {
    console.error('재료 정보 파싱 오류:', error);
    // 파싱에 실패한 경우 대체 방법으로 처리
    ingredients = recipe.ingredients.map(name => ({ name, amount: '' }));
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
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => (
                  <li key={index} className="flex justify-between py-1 border-b">
                    <span>{ingredient.name}</span>
                    <span className="text-gray-600">{ingredient.amount}</span>
                  </li>
                ))
              ) : (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="py-1 border-b">{ingredient}</li>
                ))
              )}
            </ul>
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