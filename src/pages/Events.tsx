import React, { useState, useEffect } from 'react';
import { Heart, Share2, Map, Navigation, ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { EVENT_DETAILS_BACK } from '../components/Layout';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface EventData {
  id: string;
  title: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  status: 'upcoming' | 'completed';
  liked?: boolean;
  thingsToBring?: string[];
  thingsProvided?: string[];
  description?: string;
}

const THINGS_ICONS: Record<string, string> = {
  'Hat / Cap': '🧢',
  'Face mask': '😷',
  'Reusable gloves': '🧤',
  'Event-branded t-shirts': '👕',
  'Brooms / dustpans': '🧹',
  'Hand sanitizer': '🧴',
  'Refreshments': '🥤',
  'Participation certificates': '📜',
  'Water bottle': '💧',
  'Sunscreen': '☀️',
  'Snacks': '🍎',
  'First aid kit': '🩹',
  'Waste bags': '🗑️',
};

export default function Events() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as EventData));
      setEvents(docs);
    });
    return unsubscribe;
  }, []);

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedEvents);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedEvents(newLiked);
  };

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;
  const isSelectedEventLiked = selectedEvent ? likedEvents.has(selectedEvent.id) : false;
  
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  useEffect(() => {
    // Notify Layout when selectedEvent changes
    window.dispatchEvent(
      new CustomEvent('set_internal_back', { detail: { hasBack: !!selectedEvent } })
    );

    const handleBack = () => {
      setSelectedEventId(null);
    };

    window.addEventListener(EVENT_DETAILS_BACK, handleBack);
    return () => {
      window.removeEventListener(EVENT_DETAILS_BACK, handleBack);
      // Clean up internal back on unmount
      window.dispatchEvent(
        new CustomEvent('set_internal_back', { detail: { hasBack: false } })
      );
    };
  }, [selectedEvent]);

  if (selectedEvent) {
    return (
      <div className="flex-1 overflow-y-auto bg-white flex flex-col absolute inset-0 z-10 animate-in slide-in-from-right-8 duration-300">
        
        {/* Title area */}
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-semibold text-[#1e2338] leading-tight mb-2">
            {selectedEvent.title}
          </h1>
          <div className="space-y-1">
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-1.5 grayscale opacity-70">
              <Calendar size={14} /> {selectedEvent.date} <span className="mx-0.5">|</span> <Clock size={14} /> {selectedEvent.time}
            </p>
            <p className="text-emerald-600 font-bold tracking-wide flex items-center gap-1.5">
              <MapPin size={14} /> {selectedEvent.location.address}
            </p>
          </div>
          {selectedEvent.description && (
            <p className="text-slate-600 mt-4 text-[15px] leading-relaxed">
              {selectedEvent.description}
            </p>
          )}
        </div>

        {/* Action icons */}
        <div className="flex justify-end items-center gap-4 px-6 py-3 border-b border-slate-100">
          <button 
            onClick={() => toggleLike(selectedEvent.id)}
            className="transition-colors"
          >
            <Heart 
              size={32} 
              className={isSelectedEventLiked ? "fill-[#4ebfae] text-[#4ebfae]" : "text-slate-300"} 
            />
          </button>
          <button className="bg-[#1e78c2] text-white p-2 rounded-lg transform rotate-45 flex items-center justify-center">
            <ArrowRight size={20} className="transform -rotate-45" />
          </button>
        </div>

        <div className="p-6">
          {/* Things to Bring */}
          {selectedEvent.thingsToBring && selectedEvent.thingsToBring.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[#89939e] text-lg mb-6">Things to Bring</h2>
              <ul className="space-y-6">
                {selectedEvent.thingsToBring.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <span className="text-2xl w-8 text-center flex-shrink-0">
                      {THINGS_ICONS[item] || '🎒'}
                    </span>
                    <span className="text-slate-700 text-[17px] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Things Provided */}
          {selectedEvent.thingsProvided && selectedEvent.thingsProvided.length > 0 && (
            <div>
              <h2 className="text-[#89939e] text-lg mb-6">Things Provided</h2>
              <ul className="space-y-6">
                {selectedEvent.thingsProvided.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <span className="text-2xl w-8 text-center flex-shrink-0">
                      {THINGS_ICONS[item] || '🎁'}
                    </span>
                    <span className="text-slate-700 text-[17px] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(!selectedEvent.thingsToBring?.length && !selectedEvent.thingsProvided?.length) && (
            <div className="text-center py-12">
              <p className="text-slate-400">No specific items listed for this event.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative">
      <div className="p-4 max-w-md mx-auto flex flex-col gap-6">
        
        <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
          <h2 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-2 border-b border-slate-100 pb-3">Upcoming</h2>
          <div className="flex flex-col">
            {upcomingEvents.map(event => (
              <div 
                key={event.id} 
                onClick={() => setSelectedEventId(event.id)}
                className="py-4 border-b border-slate-100 flex items-start justify-between last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 transition-colors -mx-5 px-5"
              >
                <div>
                  <h3 className="text-lg font-medium text-slate-800">{event.location.address}</h3>
                  <p className="text-xs text-emerald-500 font-semibold mt-1 mb-1">{event.date} • {event.time}</p>
                  <p className="text-sm text-slate-600">{event.title}</p>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleLike(event.id); 
                  }} 
                  className="p-2 -mr-2 transition-transform active:scale-90"
                >
                  <Heart 
                    size={24} 
                    className={cn(likedEvents.has(event.id) ? "fill-emerald-500 text-emerald-500" : "text-slate-300")} 
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
          <h2 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-2 border-b border-slate-100 pb-3">Completed</h2>
          <div className="flex flex-col">
            {completedEvents.map(event => (
              <div 
                key={event.id} 
                onClick={() => setSelectedEventId(event.id)}
                className="py-4 border-b border-slate-100 flex items-start justify-between last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 transition-colors -mx-5 px-5"
              >
                <div>
                  <h3 className="text-lg font-medium text-slate-800">{event.location.address}</h3>
                  <p className="text-xs text-emerald-500 font-semibold mt-1 mb-1">{event.date} • {event.time}</p>
                  <p className="text-sm text-slate-600">{event.title}</p>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleLike(event.id);
                  }} 
                  className="p-2 -mr-2 transition-transform active:scale-90"
                >
                  <Heart 
                    size={24} 
                    className={cn(likedEvents.has(event.id) ? "fill-emerald-500 text-emerald-500" : "text-slate-300")} 
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
