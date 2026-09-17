import { Link } from 'react-router-dom';
import { Camera, Activity, Trophy, Calendar, Newspaper } from 'lucide-react';
import DesktopHome from '../components/DesktopHome';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 pb-8 md:pb-0 bg-slate-50">
      {/* Mobile View */}
      <div className="md:hidden">
        {/* Hero Section */}
        <div className="bg-white pt-6 pb-2 px-4 flex flex-col items-center text-center relative overflow-hidden">
          <h1 className="text-4xl font-black text-black mb-1 tracking-tight">Green eye</h1>
          <p className="text-gray-500 tracking-widest text-xs uppercase mb-4">Watch. Expose. Change.</p>
          
          {/* Cityscape Illustration */}
          <div className="w-full max-w-md h-48 relative flex items-end justify-center overflow-visible mt-0">
            <img 
              src="banner.png"
              alt="Green cityscape" 
              className="w-full h-full object-cover rounded-t-[32px] shadow-sm mask-image-gradient"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="px-4 pt-6 grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
          <Link to="/report" className="col-span-1 bg-emerald-500 text-white rounded-[24px] border border-emerald-500 p-5 flex flex-col justify-between shadow-sm hover:bg-emerald-600 transition-colors min-h-[140px]">
            <h3 className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold mb-2">Report Litter</h3>
            <div className="flex-1 flex items-center justify-center">
              <Camera size={32} className="text-white" />
            </div>
          </Link>

          <Link to="/activities" className="col-span-1 bg-white rounded-[24px] border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors min-h-[140px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">My Activities</h3>
            <div className="flex-1 flex items-center justify-center">
              <Activity size={32} className="text-emerald-500" />
            </div>
          </Link>

          <Link to="/events" className="col-span-1 bg-white rounded-[24px] border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors min-h-[140px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Events</h3>
            <div className="flex-1 flex items-center justify-center">
              <Calendar size={32} className="text-emerald-500" />
            </div>
          </Link>

          <Link to="/rewards" className="col-span-1 bg-white rounded-[24px] border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors min-h-[140px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Rewards</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <Trophy size={32} className="text-emerald-500 mb-2" />
            </div>
          </Link>

          <Link to="/articles" className="col-span-2 bg-slate-800 text-white rounded-[24px] p-6 flex flex-col relative overflow-hidden shadow-md hover:bg-slate-700 transition-colors">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Learning</h3>
            <div className="font-semibold text-lg leading-snug pr-8">Educational Articles</div>
            <div className="absolute bottom-6 right-6 opacity-50 text-sm font-medium">Read →</div>
          </Link>
        </div>
      </div>

      <DesktopHome />
    </div>
  );
}
