import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full relative z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <Link href="/" className="no-underline group">
            <div className="flex items-center gap-3 transition-all duration-300 group-hover:scale-105">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transform transition-transform duration-300 group-hover:rotate-12">
                  🍳
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI 냉장고 파먹기
                </h1>
              </div>
            </div>
          </Link>
          <p className="text-sm text-gray-600 mt-3 font-medium opacity-80">
            가지고 있는 재료로 맛있는 요리를 추천해드립니다
          </p>
        </div>
      </div>
    </header>
  );
} 