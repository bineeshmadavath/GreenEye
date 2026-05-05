import { useState, useEffect } from 'react';
import { EVENT_DETAILS_BACK } from '../components/Layout';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ArticleData {
  id: string;
  title: string;
  date: string;
  content: string;
  category?: string;
  image?: string;
  imageColor?: string;
  icon?: string;
}

export default function Articles() {
  const [articlesData, setArticlesData] = useState<ArticleData[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ArticleData));
      setArticlesData(docs);
    });
    return unsubscribe;
  }, []);

  const selectedArticle = selectedArticleId ? articlesData.find(a => a.id === selectedArticleId) : null;

  useEffect(() => {
    // Notify Layout when selectedArticle changes
    window.dispatchEvent(
      new CustomEvent('set_internal_back', { detail: { hasBack: !!selectedArticle } })
    );
    window.dispatchEvent(
      new CustomEvent('set_dynamic_title', { detail: { title: selectedArticle?.title } })
    );

    const handleBack = () => {
      setSelectedArticleId(null);
    };

    window.addEventListener(EVENT_DETAILS_BACK, handleBack);
    return () => {
      window.removeEventListener(EVENT_DETAILS_BACK, handleBack);
      // Clean up internal back on unmount
      window.dispatchEvent(
        new CustomEvent('set_internal_back', { detail: { hasBack: false } })
      );
      window.dispatchEvent(
        new CustomEvent('set_dynamic_title', { detail: { title: null } })
      );
    };
  }, [selectedArticle]);

  if (selectedArticle) {
    const content = selectedArticle.content || '';
    const icon = selectedArticle.icon || '🌍';
    const imageColor = selectedArticle.imageColor || '#e0edc9';

    return (
      <div className="flex-1 overflow-y-auto bg-white flex flex-col absolute inset-0 z-10 animate-in slide-in-from-right-8 duration-300">
        
        {/* Large Illustration Header */}
        <div 
          className="w-full h-56 flex items-center justify-center relative overflow-hidden shrink-0"
          style={{ backgroundColor: imageColor }}
        >
          {/* We create a nice CSS-based dynamic illustration based on the icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {icon === '🌍' && (
              <div className="relative w-48 h-48 rounded-full bg-[#34A853]/90 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-500">
                <div className="absolute top-[20%] left-[20%] w-12 h-16 bg-[#4ebfae] rounded-full transform rotate-12 opacity-80"></div>
                <div className="absolute bottom-[20%] right-[20%] w-16 h-12 bg-[#4ebfae] rounded-full transform -rotate-12 opacity-80"></div>
                <div className="absolute top-[40%] right-[30%] w-10 h-14 bg-[#4ebfae] rounded-full transform rotate-45 opacity-60"></div>
                <div className="w-full h-full rounded-full border-4 border-white/20"></div>
                
                {/* stylized clouds */}
                <div className="absolute top-4 -left-4 w-12 h-4 bg-white rounded-full opacity-80 z-10"></div>
                <div className="absolute top-2 -left-2 w-8 h-4 bg-white rounded-full opacity-80 z-10"></div>
                
                <div className="absolute bottom-8 -right-4 w-12 h-4 bg-white rounded-full opacity-80 z-10"></div>
                <div className="absolute bottom-6 -right-2 w-8 h-4 bg-white rounded-full opacity-80 z-10"></div>
                
                <div className="absolute top-6 right-0 w-8 h-3 bg-white rounded-full opacity-80 z-10"></div>
              </div>
            )}
            
            {icon !== '🌍' && (
               <div className="text-[100px] transform hover:scale-110 transition-transform duration-500 origin-center drop-shadow-xl z-10">
                 {icon}
               </div>
            )}

            {/* General decorative background elements */}
            <div className="absolute -left-12 -top-12 w-32 h-32 rounded-full border-[10px] border-white/10"></div>
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full border-[8px] border-white/10"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight mb-1">
            {selectedArticle.title}
          </h1>
          <p className="text-sm text-[#0F6B59] font-semibold mb-6 tracking-wide">
            {selectedArticle.date}
          </p>
          
          <div className="prose prose-slate max-w-none">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-[15px] leading-relaxed text-slate-500 mb-5">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
        
        {articlesData.map((article) => (
          <div key={article.id} className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md cursor-pointer" onClick={() => setSelectedArticleId(article.id)}>
            <div className="flex gap-4">
              {/* Box Image */}
              <div 
                className="w-20 h-20 shrink-0 rounded-[20px] flex items-center justify-center text-4xl shadow-inner border border-slate-100"
                style={{ backgroundColor: article.imageColor || '#fef3c7' }}
              >
                {article.icon || '📄'}
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1.5">{article.title}</h3>
                <p className="text-[11px] text-[#0F6B59] font-bold uppercase tracking-wider">{article.date}</p>
              </div>
            </div>
            <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-3">
              {article.content}
            </p>
            <div className="flex justify-end mt-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedArticleId(article.id);
                }}
                className="text-[14px] font-semibold text-[#0F6B59] hover:text-[#0c5748] flex items-center transition-colors"
                >
                  Read Article <span className="ml-1 text-lg leading-none">→</span>
              </button>
            </div>
          </div>
        ))}

        {articlesData.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No articles published yet.
          </div>
        )}

      </div>
    </div>
  );
}
