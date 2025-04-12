import Footer from '@/components/Footer';
import Header from '@/components/Header';
import IngredientInput from '@/components/IngredientInput';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-full max-w-xl text-center mb-12 relative">
          <div className="absolute -top-16 right-0 text-accent opacity-10 transform rotate-12">
            <span className="text-9xl">🥕</span>
          </div>
          <div className="absolute -bottom-16 left-0 text-secondary opacity-10 transform -rotate-12">
            <span className="text-9xl">🍲</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            오늘 <span className="text-primary">뭐 먹지?</span><br/>
            재료만 알려주세요!
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">
            가지고 있는 식재료를 입력하고<br className="hidden md:block" /> 
            맞춤 레시피를 추천받으세요.
          </p>
          <div className="mt-4 text-sm bg-accent/10 text-gray-800 font-medium inline-block py-2 px-4 rounded-full border border-accent/20">
            재료는 쉼표(,)로 구분해주세요
          </div>
        </div>
        
        <div className="w-full max-w-md relative">
          <IngredientInput />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
