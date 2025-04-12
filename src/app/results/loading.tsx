import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full max-w-md mb-8"></div>
          
          <div className="bg-white rounded-2xl p-5 shadow-md mb-8">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-8 bg-primary/10 rounded-full w-20"></div>
              <div className="h-8 bg-primary/10 rounded-full w-24"></div>
              <div className="h-8 bg-primary/10 rounded-full w-16"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="recipe-card bg-white rounded-2xl overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 