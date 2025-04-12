import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-6 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Link href="/" className="no-underline">
          <h1 className="text-3xl font-bold text-center text-primary">
            AI 냉장고 파먹기
          </h1>
        </Link>
        <p className="text-sm text-gray-600 mt-2 font-medium">
          가지고 있는 재료로 맛있는 요리를 추천해드립니다
        </p>
      </div>
    </header>
  );
} 