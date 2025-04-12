export default function Footer() {
  return (
    <footer className="w-full py-6 mt-12 bg-gray-800 text-white">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <p className="text-gray-100 font-medium">AI 종합설계 1조</p>
        <p className="mt-2 text-sm text-gray-300">
          Data based on <span className="text-accent font-medium">만개의 레시피</span>
        </p>
        <p className="mt-4 text-xs text-gray-400">© 2024 AI 냉장고 파먹기</p>
      </div>
    </footer>
  );
} 