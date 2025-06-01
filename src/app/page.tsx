import Footer from '@/components/Footer';
import Header from '@/components/Header';
import IngredientInput from '@/components/IngredientInput';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션과 장식 요소 */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* 떠다니는 장식 요소들 */}
      <div className="absolute top-20 right-10 opacity-5 text-9xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        🥕
      </div>
      <div className="absolute top-40 left-10 opacity-5 text-7xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        🍅
      </div>
      <div className="absolute bottom-32 right-20 opacity-5 text-8xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
        🍲
      </div>
      <div className="absolute bottom-20 left-16 opacity-5 text-6xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
        🧄
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center relative z-10">
        {/* 간단한 헤더 섹션 */}
        <div className="w-full max-w-4xl text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-2xl">🍳</span>
            <span className="text-sm font-medium text-gray-700">AI 기반 레시피 추천 서비스</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              오늘 뭐 먹지?
            </span>
            <br />
            <span className="text-gray-800 text-2xl md:text-3xl">
              재료만 알려주세요!
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
            <span className="font-semibold text-gray-800">냉장고에 있는 재료</span>를 입력하면
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent font-semibold">
              AI가 맞춤 레시피
            </span>를 추천해드려요
          </p>
        </div>
        
        {/* 재료 입력 영역 - 메인 위치로 이동 */}
        <div className="w-full max-w-2xl mb-8">
          <IngredientInput />
        </div>

        {/* 특징 카드들 - 더 간단하게 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="glass-effect p-4 rounded-2xl text-center">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-800 text-sm">AI 추천</h3>
          </div>
          <div className="glass-effect p-4 rounded-2xl text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800 text-sm">빠른 검색</h3>
          </div>
          <div className="glass-effect p-4 rounded-2xl text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-800 text-sm">맞춤 추천</h3>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="text-center max-w-2xl">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span>10,000+ 레시피</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>실시간 매칭</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span>무료 서비스</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
