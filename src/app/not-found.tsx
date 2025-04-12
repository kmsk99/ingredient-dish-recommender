import Link from 'next/link';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-8 text-center">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link 
          href="/" 
          className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-md"
        >
          메인으로 돌아가기
        </Link>
      </main>
      
      <Footer />
    </div>
  );
} 