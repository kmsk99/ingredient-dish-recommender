import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션과 장식 요소 */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* 떠다니는 장식 요소들 */}
      <div className="absolute top-20 right-10 opacity-5 text-7xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        🍽️
      </div>
      <div className="absolute top-60 left-10 opacity-5 text-6xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        🥘
      </div>
      <div className="absolute bottom-40 right-20 opacity-5 text-8xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
        👨‍🍳
      </div>
      <div className="absolute bottom-20 left-16 opacity-5 text-5xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
        🔍
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="animate-pulse">
          {/* 뒤로가기 버튼 스켈레톤 */}
          <div className="glass-effect h-10 w-40 rounded-xl mb-6"></div>
          
          {/* 페이지 제목 스켈레톤 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl"></div>
            <div>
              <div className="h-8 bg-gray-200/80 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200/60 rounded w-64"></div>
            </div>
          </div>
          
          {/* 재료 관리 카드 스켈레톤 */}
          <div className="card mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg"></div>
                <div className="h-6 bg-gray-200/80 rounded w-24"></div>
              </div>
              
              {/* 선택된 재료 스켈레톤 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 bg-gray-200/80 rounded w-20"></div>
                  <div className="h-5 bg-primary/20 rounded-full w-8"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 bg-primary/10 rounded-full w-20"></div>
                  <div className="h-8 bg-primary/10 rounded-full w-16"></div>
                  <div className="h-8 bg-primary/10 rounded-full w-24"></div>
                </div>
              </div>
              
              {/* 입력 필드 스켈레톤 */}
              <div className="h-12 bg-gray-200/80 rounded-xl w-full mb-3"></div>
              
              {/* 도움말 텍스트 스켈레톤 */}
              <div className="h-3 bg-gray-200/60 rounded w-3/4"></div>
            </div>
          </div>
          
          {/* 결과 카운트 스켈레톤 */}
          <div className="text-center mb-8">
            <div className="glass-effect h-10 w-64 rounded-full mx-auto"></div>
          </div>
          
          {/* 레시피 카드 스켈레톤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-200/80 to-gray-300/60"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200/80 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200/60 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200/60 rounded w-5/6 mb-4"></div>
                  
                  {/* 재료 태그 스켈레톤 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    <div className="h-5 bg-primary/20 rounded-full w-12"></div>
                    <div className="h-5 bg-primary/20 rounded-full w-16"></div>
                    <div className="h-5 bg-primary/20 rounded-full w-14"></div>
                  </div>
                  
                  {/* 점수 스켈레톤 */}
                  <div className="h-4 bg-accent/20 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 로딩 인디케이터 */}
        <div className="fixed bottom-8 right-8">
          <div className="glass-effect p-4 rounded-2xl border border-white/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">레시피 검색 중...</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 