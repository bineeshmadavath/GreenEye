import { useState, useEffect } from 'react';
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, UserCircle, X, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../lib/firebase';
import { cn } from '../lib/utils';

// Custom event to handle back from Event Details
export const EVENT_DETAILS_BACK = 'event_details_back';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Manage internal back buttons (like returning from event details without changing route)
  const [hasInternalBack, setHasInternalBack] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);

  useEffect(() => {
    const handleInternalBack = (e: CustomEvent) => {
      setHasInternalBack(e.detail.hasBack);
    };
    const handleDynamicTitle = (e: CustomEvent) => {
      setDynamicTitle(e.detail.title || null);
    };
    
    window.addEventListener('set_internal_back' as any, handleInternalBack);
    window.addEventListener('set_dynamic_title' as any, handleDynamicTitle);
    // Reset when location changes
    return () => {
      window.removeEventListener('set_internal_back' as any, handleInternalBack);
      window.removeEventListener('set_dynamic_title' as any, handleDynamicTitle);
    };
  }, []);

  useEffect(() => {
    setHasInternalBack(false);
    setDynamicTitle(null);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  
  const handleBackClick = (e: React.MouseEvent) => {
    if (hasInternalBack) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent(EVENT_DETAILS_BACK));
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Green eye';
      case '/report': return 'Report Litter';
      case '/activities': return 'My Activities';
      case '/rewards': return 'Rewards';
      case '/events': return 'Events';
      case '/articles': return 'Articles';
      case '/admin': return 'Admin Dashboard';
      default: return 'Green eye';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#0F6B59] text-white px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          {isHome ? (
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1">
              <Menu size={24} />
            </button>
          ) : (
            <Link to="/" onClick={handleBackClick} className="md:hidden p-1">
              <ArrowLeft size={24} />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{dynamicTitle || (isHome ? 'Green eye' : getPageTitle())}</h1>
            {isHome && <p className="text-[10px] tracking-widest uppercase opacity-80 hidden md:block">Watch. Expose. Change.</p>}
          </div>
        </div>

        {/* Desktop Navigation */}
        {isHome && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-emerald-200 border-b-2 border-white pb-1">Home</a>
            <a href="#activities" className="hover:text-emerald-200 transition-colors">My Activities</a>
            <a href="#rewards" className="hover:text-emerald-200 transition-colors">Rewards</a>
            <a href="#events" className="hover:text-emerald-200 transition-colors">Events</a>
            <a href="#articles" className="hover:text-emerald-200 transition-colors">Articles</a>
            <a href="#contact" className="hover:text-emerald-200 transition-colors">Contact Us</a>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isHome && (
            <button onClick={() => setIsSidebarOpen(true)}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/20" referrerPolicy="no-referrer" />
              ) : (
                <UserCircle size={28} />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-white z-40 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 border-b flex flex-col items-center relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-500"
          >
            <X size={24} />
          </button>
          
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full mb-4" referrerPolicy="no-referrer" />
          ) : (
            <UserCircle size={80} className="text-emerald-500 mb-4" />
          )}
          <h2 className="text-xl font-semibold text-slate-800">{user?.displayName || 'User'}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        
        <div className="p-4 flex-1 space-y-2">
          {profile?.role === 'admin' && (
            <Link 
              to="/admin" 
              onClick={() => setIsSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 font-bold hover:bg-slate-50 rounded-xl transition-colors mb-4 border border-emerald-100 bg-emerald-50/30"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Users size={18} />
              </div>
              Admin Dashboard
            </Link>
          )}
          
          <button 
            onClick={() => {
              logOut();
              setIsSidebarOpen(false);
            }}
            className="w-full text-center py-3 text-emerald-500 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Signout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
