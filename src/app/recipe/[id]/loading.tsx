import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션과 장식 요소 */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* 떠다니는 장식 요소들 */}
      <div className="absolute top-20 right-10 opacity-5 text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        👨‍🍳
      </div>
      <div className="absolute top-60 left-10 opacity-5 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        📖
      </div>
      <div className="absolute bottom-40 right-20 opacity-5 text-7xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
        🍽️
      </div>
      <div className="absolute bottom-20 left-16 opacity-5 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
        ⭐
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="animate-pulse">
          {/* 뒤로가기 버튼 스켈레톤 */}
          <div className="glass-effect h-10 w-52 rounded-xl mb-6"></div>
          
          {/* 레시피 메인 카드 스켈레톤 */}
          <div className="card overflow-hidden mb-8">
            {/* 이미지 영역 스켈레톤 */}
            <div className="relative h-80 md:h-96 w-full bg-gradient-to-br from-gray-200/80 to-gray-300/60">
              {/* 제목 오버레이 스켈레톤 */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                  <div className="glass-effect w-16 h-6 rounded-full"></div>
                </div>
                <div className="h-8 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-white/20 rounded w-20"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              </div>
            </div>

            {/* 재료 섹션 스켈레톤 */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary/20 rounded-lg"></div>
                <div className="h-6 bg-gray-200/80 rounded w-16"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/20 rounded-full"></div>
                      <div className="h-5 bg-gray-200/80 rounded w-20"></div>
                    </div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50/80 rounded-lg">
                          <div className="h-4 bg-gray-200/80 rounded w-24"></div>
                          <div className="h-5 bg-primary/20 rounded-full w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 조리법 섹션 스켈레톤 */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-accent/20 rounded-lg"></div>
                <div className="h-6 bg-gray-200/80 rounded w-20"></div>
              </div>

              <div className="text-center py-8">
                <div className="glass-effect p-6 rounded-2xl max-w-md mx-auto">
                  <div className="w-12 h-12 bg-gray-200/80 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200/80 rounded w-48 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200/60 rounded w-64 mx-auto mb-6"></div>
                  <div className="h-12 bg-primary/20 rounded-xl w-48 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 스켈레톤 */}
          <div className="mt-8 text-center">
            <div className="glass-effect h-12 w-40 rounded-xl mx-auto"></div>
          </div>
        </div>

        {/* 로딩 인디케이터 */}
        <div className="fixed bottom-8 right-8">
          <div className="glass-effect p-4 rounded-2xl border border-white/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">레시피 불러오는 중...</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 