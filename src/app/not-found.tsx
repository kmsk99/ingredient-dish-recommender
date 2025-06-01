import Link from 'next/link';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션과 장식 요소 */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* 떠다니는 장식 요소들 */}
      <div className="absolute top-20 right-20 opacity-5 text-8xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        🔍
      </div>
      <div className="absolute top-40 left-20 opacity-5 text-6xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        📱
      </div>
      <div className="absolute bottom-32 right-32 opacity-5 text-7xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
        🏠
      </div>
      <div className="absolute bottom-20 left-24 opacity-5 text-5xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
        🧭
      </div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center relative z-10">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 애니메이션 */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
              404
            </div>
          </div>
          
          {/* 메인 메시지 카드 */}
          <div className="glass-effect p-8 rounded-3xl mb-8 border border-white/30">
            <div className="text-6xl mb-4 animate-bounce">😵‍💫</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              페이지를 찾을 수 없어요
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              요청하신 페이지가 존재하지 않거나<br />
              이동되었을 수 있습니다
            </p>
            
            {/* 제안 아이콘들 */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <span className="text-xl">🔍</span>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              메인으로 돌아가기
            </Link>
            
            <div className="text-sm text-gray-500">
              또는 브라우저의 뒤로가기 버튼을 눌러주세요
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 