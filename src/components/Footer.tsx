export default function Footer() {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-lg border-t border-gray-200/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* 메인 정보 */}
          <div className="text-center">
            <div className="flex items-center gap-3 justify-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white">
                🎓
              </div>
              <p className="text-lg font-bold text-gray-800">인공지능 종합설계 1조</p>
            </div>
            <p className="text-sm text-gray-600">
              Data powered by <span className="font-semibold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">만개의 레시피</span>
            </p>
          </div>

          {/* 구분선 */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

          {/* 기술 스택 */}
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Next.js</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Supabase</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>TypeScript</span>
            </div>
          </div>

          {/* 저작권 */}
          <p className="text-xs text-gray-400 font-medium">
            © 2024 AI 냉장고 파먹기. Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
} 