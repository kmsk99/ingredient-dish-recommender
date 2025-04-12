import Footer from '@/components/Footer';
import Header from '@/components/Header';
import IngredientInput from '@/components/IngredientInput';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-full max-w-xl text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-primary">
            오늘 뭐 먹지? 재료만 알려주세요!
          </h2>
          <p className="text-gray-600 text-lg">
            가지고 있는 식재료를 입력하고 맞춤 레시피를 추천받으세요.
            <br />재료는 쉼표(,)로 구분해주세요.
          </p>
        </div>
        
        <div className="w-full max-w-md relative pb-28">
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-24 h-24 text-primary-hover opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 transform -translate-x-1/3 translate-y-1/2 w-28 h-28 text-secondary opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <IngredientInput />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
