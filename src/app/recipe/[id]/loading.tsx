import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          
          <div className="bg-white rounded-2xl overflow-hidden shadow-md">
            <div className="h-80 md:h-96 w-full bg-gray-200"></div>
            
            <div className="p-6 md:p-8">
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              
              <div className="h-4 bg-gray-200 rounded w-full max-w-lg mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full max-w-md mb-6"></div>
              
              <div className="mt-8">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded-xl mb-2"></div>
                  ))}
                </div>
                
                <div className="h-6 bg-gray-200 rounded w-32 mt-8 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 