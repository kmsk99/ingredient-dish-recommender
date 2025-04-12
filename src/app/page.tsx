import Footer from '@/components/Footer';
import Header from '@/components/Header';
import IngredientInput from '@/components/IngredientInput';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center mb-2">오늘 뭐 먹지? 재료만 알려주세요!</h2>
        <p className="text-center text-gray-600 mb-8 max-w-lg">
          가지고 있는 식재료를 입력하고 맞춤 레시피를 추천받으세요.
          재료는 쉼표(,)로 구분해주세요.
        </p>
        
        <IngredientInput />
      </main>
      
      <Footer />
    </div>
  );
}
