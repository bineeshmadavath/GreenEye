import { useState } from 'react';
import { Gift, ExternalLink, Store, Star, Copy, Globe, Check, ShoppingBag, ShoppingCart, Coffee, Utensils } from 'lucide-react';
import { cn } from '../lib/utils';

const pointHistory = [
  { id: 1, location: 'Ernakulam', date: '05-01-2025', points: 10 },
  { id: 2, location: 'Trivandrum', date: '05-01-2025', points: 10 },
  { id: 3, location: 'Malappuram', date: '05-01-2025', points: 10 },
  { id: 4, location: 'Calicut', date: '05-01-2025', points: 10 },
  { id: 5, location: 'Trissur', date: '05-01-2025', points: 10 },
  { id: 6, location: 'Perintalmanna', date: '05-01-2025', points: 10 },
];

const stores = [
  { id: 'amazon', name: 'Amazon', color: 'bg-emerald-100', icon: ShoppingCart },
  { id: 'flipkart', name: 'Flipkart', color: 'bg-yellow-100', icon: ShoppingBag },
  { id: 'meesho', name: 'Meesho', color: 'bg-purple-800', icon: ShoppingBag, iconColor: 'text-white' },
  { id: 'zomato', name: 'Zomato', color: 'bg-red-500', icon: Utensils, iconColor: 'text-white' },
  { id: 'swiggy', name: 'Swiggy', color: 'bg-orange-500', icon: Coffee, iconColor: 'text-white' },
];

export default function Rewards() {
  const [isHowToRedeemOpen, setIsHowToRedeemOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  
  const [selectedStore, setSelectedStore] = useState('amazon');
  const [pointsToRedeem, setPointsToRedeem] = useState('25');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`GREENCODE${pointsToRedeem}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative">
      <div className="p-4 flex flex-col items-center max-w-md mx-auto gap-4">
        
        <div className="bg-white w-full rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col items-center">
          {/* Image */}
          <div className="w-full max-w-[280px] h-48 relative mt-2 mb-6 flex justify-center items-center">
            <img 
              src="/reward-image.png" 
              alt="Rewards and Gifts" 
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl text-slate-800 mb-6 font-medium">
            You earned <span className="font-bold text-black font-sans tracking-tight text-3xl">60</span> Points
          </h2>

          <button 
            onClick={() => setIsRedeemModalOpen(true)}
            className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md mb-4"
          >
            Redeem Points
          </button>

          <button 
            onClick={() => setIsHowToRedeemOpen(true)}
            className="flex items-center justify-center w-full py-2 hover:bg-slate-50 transition-colors rounded-lg text-slate-600"
          >
            <span className="text-[15px] font-medium mr-2">How to redeem points</span>
            <ExternalLink size={18} />
          </button>
        </div>

        <div className="w-full bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
          <h3 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-4 border-b border-slate-100 pb-4">Your point bank</h3>
          
          <div className="flex flex-col">
            {pointHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="text-emerald-500 bg-emerald-50 p-2.5 rounded-xl">
                    <Gift size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-medium text-[15px]">{item.location}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg">{item.points}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Overlay Modal */}
      {isHowToRedeemOpen && (
        <div 
          className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setIsHowToRedeemOpen(false)}
        >
          <div 
            className="bg-white rounded-[16px] w-full max-w-[340px] p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] text-slate-600 font-medium mb-6">How to Redeem Points</h3>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-5 py-5 border-b border-slate-100">
                <div className="text-[#0F6B59] shrink-0">
                  <Store size={28} strokeWidth={1.5} />
                </div>
                <span className="text-[17px] text-slate-800 font-medium">Select a store</span>
              </div>
              
              <div className="flex items-center gap-5 py-5 border-b border-slate-100">
                <div className="text-[#0F6B59] shrink-0">
                  <Star size={28} strokeWidth={1.5} />
                </div>
                <span className="text-[17px] text-slate-800 font-medium">Enter number of points</span>
              </div>

              <div className="flex items-center gap-5 py-5 border-b border-slate-100">
                <div className="text-[#0F6B59] shrink-0">
                  <Copy size={28} strokeWidth={1.5} />
                </div>
                <span className="text-[17px] text-slate-800 font-medium">Copy the coupon code</span>
              </div>

              <div className="flex items-center gap-5 py-5">
                <div className="text-[#0F6B59] shrink-0">
                  <Globe size={28} strokeWidth={1.5} />
                </div>
                <span className="text-[17px] text-slate-800 font-medium">Go to stores website</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Bottom Sheet Modal */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
          <div 
            className="bg-white rounded-t-[32px] w-full max-h-[90vh] shadow-xl relative animate-in slide-in-from-bottom duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            <div className="px-6 py-4 shrink-0">
              <h2 className="text-xl font-medium text-slate-800 text-center relative">
                Redeem Points
                <button 
                  onClick={() => setIsRedeemModalOpen(false)} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors hidden"
                >
                  {/* Kept hidden unless close button is requested, clicking outside is better but keeping structure */}
                </button>
              </h2>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-w-md mx-auto w-full">
              
              {/* Select a Store */}
              <div className="mb-8 relative">
                <h3 className="text-[#3b415a] mb-4 text-[15px]">Select a Store</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                  {stores.map((store) => {
                    const isSelected = selectedStore === store.id;
                    const Icon = store.icon;
                    return (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStore(store.id)}
                        className={cn(
                          "w-16 h-16 rounded-[14px] flex items-center justify-center shrink-0 border-[3px] transition-all relative overflow-hidden",
                          isSelected ? "border-emerald-400 p-[2px]" : "border-white shadow-[0_2px_10px_rgb(0,0,0,0.06)]"
                        )}
                      >
                        <div className={cn("w-full h-full rounded-[10px] flex items-center justify-center relative", store.color)}>
                         <Icon size={32} className={cn(store.iconColor || "text-emerald-700 opacity-60")} />
                         
                         {/* Make it mock Amazon exactly */}
                         {store.id === 'amazon' && (
                           <div className="absolute inset-0 bg-emerald-100 flex items-center justify-center">
                             <span className="text-2xl font-serif text-emerald-800 absolute top-2 pb-1">a</span>
                             <svg className="w-8 h-4 absolute bottom-3 text-emerald-700" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4 C10 12 14 12 20 4"></path></svg>
                           </div>
                         )}

                         {/* Make it mock Flipkart exactly */}
                         {store.id === 'flipkart' && (
                            <div className="absolute inset-0 bg-yellow-300 flex items-center justify-center">
                              <span className="text-3xl font-serif italic text-blue-800 font-bold pr-1">f</span>
                            </div>
                         )}
                         
                         {/* Make it mock Zomato exactly */}
                         {store.id === 'zomato' && (
                            <div className="absolute inset-0 bg-red-500 flex items-center justify-center">
                              <span className="text-[11px] font-bold italic text-white tracking-wider">zomato</span>
                            </div>
                         )}
                         
                         {/* Make it mock Meesho exactly */}
                         {store.id === 'meesho' && (
                            <div className="absolute inset-0 bg-purple-900 flex items-center justify-center">
                              <span className="text-3xl font-bold text-pink-500">m</span>
                            </div>
                         )}
                        </div>
                        
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white rounded-full p-1 shadow-sm border border-emerald-100 z-10 w-6 h-6 flex items-center justify-center mt-2">
                              <Check size={14} className="text-emerald-500 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Enter number of points */}
              <div className="mb-8">
                <h3 className="text-[#3b415a] mb-4 text-[15px]">Enter number of points</h3>
                <input 
                  type="text" 
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  className="w-full bg-[#f8faf9] border-b border-slate-300 outline-none px-4 py-4 text-lg font-medium text-slate-800 rounded-t-lg"
                  placeholder="0"
                />
              </div>

              {/* Copy Coupon Code */}
              <div className="mb-10">
                <h3 className="text-[#3b415a] mb-4 text-[15px]">Copy Coupon Code</h3>
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-100/80 rounded-xl px-4 py-4 flex items-center justify-center">
                    <span className="text-2xl font-medium text-[#2d2f40] tracking-wide">GREENCODE{pointsToRedeem || '0'}</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="bg-emerald-500 text-white p-4 rounded-xl shadow-md hover:bg-emerald-600 transition-colors shrink-0 flex items-center justify-center"
                  >
                    {isCopied ? <Check size={28} /> : <div className="relative">
                      <div className="border-[2.5px] border-white w-[18px] h-[20px] rounded-[4px] absolute right-[-4px] top-[-4px]"></div>
                      <div className="border-[2.5px] border-white border-dashed w-[18px] h-[20px] rounded-[4px] relative bg-emerald-500 z-10"></div>
                    </div>}
                  </button>
                </div>
              </div>

            </div>
          </div>
          
          {/* Invisible backdrop click area for the rest of the space to close modal */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsRedeemModalOpen(false)}></div>
        </div>
      )}

    </div>
  );
}
