import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  MapPin, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Check, 
  X, 
  Clock, 
  Plus, 
  Users,
  Search,
  ArrowUpDown,
  Map as MapIcon,
  Crosshair
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet marker icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Report {
  id: string;
  type: string;
  quantity: string;
  location: { address: string; lat: number; lng: number };
  status: 'pending' | 'assigned' | 'resolved';
  createdAt: any;
  comment?: string;
  assignedTo?: string;
}

interface Event {
  id: string;
  title: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  description?: string;
  status: 'upcoming' | 'completed';
  thingsToBring?: string[];
  thingsProvided?: string[];
}

interface Article {
  id: string;
  title: string;
  date: string;
  category?: string;
}

export default function Admin() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'events' | 'articles'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [quantityFilter, setQuantityFilter] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  
  // Modals
  const [assigningReport, setAssigningReport] = useState<Report | null>(null);
  const [assignee, setAssignee] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Form states
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    location: {
      address: '',
      lat: 9.958491,
      lng: 76.239932
    }, 
    date: '', 
    time: '', 
    description: '',
    status: 'upcoming' as 'upcoming' | 'completed',
    thingsToBring: [] as string[],
    thingsProvided: [] as string[]
  });
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: '', date: new Date().toLocaleDateString() });

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    // Fetch reports
    const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
    });

    // Fetch events
    const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    });

    // Fetch articles
    const articlesQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribeArticles = onSnapshot(articlesQuery, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    });

    return () => {
      unsubscribeReports();
      unsubscribeEvents();
      unsubscribeArticles();
    };
  }, [profile]);

  const handleAssign = async () => {
    if (!assigningReport || !assignee) return;
    try {
      await updateDoc(doc(db, 'reports', assigningReport.id), {
        status: 'assigned',
        assignedTo: assignee,
        assignedAt: serverTimestamp()
      });
      setAssigningReport(null);
      setAssignee('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditEvent = (event: Event) => {
    setNewEvent({
      title: event.title,
      location: event.location,
      date: event.date,
      time: event.time,
      description: event.description || '',
      status: event.status,
      thingsToBring: event.thingsToBring || [],
      thingsProvided: event.thingsProvided || []
    });
    setEditingEventId(event.id);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        await updateDoc(doc(db, 'events', editingEventId), {
          ...newEvent,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'events'), {
          ...newEvent,
          status: 'upcoming',
          authorUID: profile?.uid,
          createdAt: serverTimestamp()
        });
      }
      setIsEventModalOpen(false);
      setEditingEventId(null);
      setNewEvent({ title: '', location: { address: '', lat: 9.958491, lng: 76.239932 }, date: '', time: '', description: '', status: 'upcoming', thingsToBring: [], thingsProvided: [] });
    } catch (err) {
      console.error(err);
    }
  };

  function EventMapUpdater({ center }: { center: [number, number] }) {
    const map = useMapEvents({
      click(e) {
        setNewEvent(prev => ({
          ...prev,
          location: { ...prev.location, lat: e.latlng.lat, lng: e.latlng.lng }
        }));
      },
    });

    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  }

  const toggleThing = (list: 'thingsToBring' | 'thingsProvided', thing: string) => {
    setNewEvent(prev => {
      const currentList = prev[list];
      if (currentList.includes(thing)) {
        return { ...prev, [list]: currentList.filter(t => t !== thing) };
      } else {
        return { ...prev, [list]: [...currentList, thing] };
      }
    });
  };

  const EVENT_THINGS_OPTIONS = [
    'Hat / Cap',
    'Face mask',
    'Reusable gloves',
    'Event-branded t-shirts',
    'Brooms / dustpans',
    'Hand sanitizer',
    'Refreshments',
    'Participation certificates',
    'Water bottle',
    'Sunscreen',
    'Snacks',
    'First aid kit',
    'Waste bags'
  ];

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'articles'), {
        ...newArticle,
        authorUID: profile?.uid,
        authorName: profile?.displayName || 'Admin',
        createdAt: serverTimestamp()
      });
      setIsArticleModalOpen(false);
      setNewArticle({ title: '', content: '', category: '', date: new Date().toLocaleDateString() });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesType = !typeFilter || r.type === typeFilter;
    const matchesQuantity = !quantityFilter || r.quantity === quantityFilter;
    const matchesLocation = !locationSearch || r.location.address.toLowerCase().includes(locationSearch.toLowerCase());
    return matchesType && matchesQuantity && matchesLocation;
  });

  if (profile?.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
          <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage reports, events, and articles</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 self-start">
            <button 
              onClick={() => setActiveTab('reports')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'reports' ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Reports
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'events' ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Events
            </button>
            <button 
              onClick={() => setActiveTab('articles')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'articles' ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Articles
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-black text-slate-900">{reports.filter(r => r.status === 'pending').length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Assigned</p>
                    <p className="text-2xl font-black text-slate-900">{reports.filter(r => r.status === 'assigned').length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                    <Check size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Resolved</p>
                    <p className="text-2xl font-black text-slate-900">{reports.filter(r => r.status === 'resolved').length}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  <Search size={20} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search location..." 
                    className="bg-transparent border-none outline-none w-full text-slate-700 font-medium"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 outline-none text-slate-700 font-bold text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="organic">Organic</option>
                    <option value="recyclable">Recyclable</option>
                    <option value="hazardous">Hazardous</option>
                  </select>
                  <select 
                    className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 outline-none text-slate-700 font-bold text-sm"
                    value={quantityFilter}
                    onChange={(e) => setQuantityFilter(e.target.value)}
                  >
                    <option value="">All Quantities</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-6 py-4 text-xs font-bold text-slate-400">
                            {report.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-700 font-bold text-xs">{report.quantity}</span>
                          </td>
                          <td className="px-6 py-4 max-w-[200px]">
                            <p className="text-slate-800 font-medium text-xs truncate">{report.location.address}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                report.status === 'pending' ? "bg-amber-500" :
                                report.status === 'assigned' ? "bg-blue-500" : "bg-emerald-500"
                              )} />
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-tighter",
                                report.status === 'pending' ? "text-amber-600" :
                                report.status === 'assigned' ? "text-blue-600" : "text-emerald-600"
                              )}>
                                {report.status}
                                {report.assignedTo && <span className="text-slate-400 ml-1">({report.assignedTo})</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {report.status === 'pending' && (
                              <button 
                                onClick={() => setAssigningReport(report)}
                                className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-100 transition-colors"
                              >
                                Assign
                              </button>
                            )}
                            {report.status === 'assigned' && (
                               <button 
                                 onClick={async () => {
                                   await updateDoc(doc(db, 'reports', report.id), { status: 'resolved' });
                                 }}
                                 className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-600 transition-colors shadow-sm"
                               >
                                 Resolve
                               </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredReports.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 font-medium">No reports found matching filters.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div 
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Community Events</h2>
                  <p className="text-slate-500 text-sm">Create and track cleaning drives</p>
                </div>
                <button 
                  onClick={() => setIsEventModalOpen(true)}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-emerald-600 transition-all active:scale-95"
                >
                  <Plus size={20} /> New Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <div key={event.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{event.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {event.location.address}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {event.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                         "text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg",
                         event.status === 'upcoming' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {event.status}
                      </span>
                      <button 
                        onClick={() => handleOpenEditEvent(event)}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div 
              key="articles"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Knowledge Hub</h2>
                  <p className="text-slate-500 text-sm">Publish articles and news</p>
                </div>
                <button 
                   onClick={() => setIsArticleModalOpen(true)}
                   className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-emerald-600 transition-all active:scale-95"
                >
                  <FileText size={20} /> Publish Article
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recent Articles</p>
                 </div>
                 <div className="divide-y divide-slate-100">
                   {articles.map(article => (
                     <div key={article.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{article.title}</h3>
                            <p className="text-xs text-slate-400 font-medium">Published on {article.date} • {article.category || 'General'}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300" />
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal for Assignment */}
        <AnimatePresence>
          {assigningReport && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assign Task</h2>
                  <button onClick={() => setAssigningReport(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-8">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Local Governance Team</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  >
                    <option value="">Select a team...</option>
                    <option value="Kochi Municipality">Kochi Municipality</option>
                    <option value="Kakkanad Health Dept.">Kakkanad Health Dept.</option>
                    <option value="Fort Kochi Sanitation">Fort Kochi Sanitation</option>
                    <option value="Green Kerala Army">Green Kerala Army</option>
                  </select>
                </div>
                <button 
                  onClick={handleAssign}
                  disabled={!assignee}
                  className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Assignment
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal for New Event */}
        <AnimatePresence>
          {isEventModalOpen && (
             <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8"
               >
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                     {editingEventId ? 'Update Event' : 'Create Event'}
                   </h2>
                   <button onClick={() => {
                     setIsEventModalOpen(false);
                     setEditingEventId(null);
                     setNewEvent({ title: '', location: { address: '', lat: 9.958491, lng: 76.239932 }, date: '', time: '', description: '', status: 'upcoming', thingsToBring: [], thingsProvided: [] });
                   }} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={20} />
                   </button>
                 </div>
                 <form onSubmit={handleCreateEvent} className="space-y-6">
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Event Title</label>
                     <input 
                       required
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500" 
                       value={newEvent.title}
                       onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                       placeholder="Cleaning Drive at Fort Kochi"
                     />
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location Address</label>
                     <div className="flex gap-2">
                       <div className="relative flex-1">
                         <input 
                           required
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500" 
                           value={newEvent.location.address}
                           onChange={e => setNewEvent({...newEvent, location: { ...newEvent.location, address: e.target.value }})}
                           placeholder="Fort Kochi Beach"
                         />
                         <button 
                           type="button"
                           onClick={() => setIsLocationPickerOpen(!isLocationPickerOpen)}
                           className={cn(
                             "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors",
                             isLocationPickerOpen ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                           )}
                         >
                           <MapIcon size={20} />
                         </button>
                       </div>
                     </div>
                     
                     <AnimatePresence>
                       {isLocationPickerOpen && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="mt-4 overflow-hidden"
                         >
                           <div className="rounded-[24px] overflow-hidden border-2 border-slate-100 h-64 relative bg-slate-50">
                             <MapContainer center={[newEvent.location.lat, newEvent.location.lng]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                               <Marker position={[newEvent.location.lat, newEvent.location.lng]} />
                               <EventMapUpdater center={[newEvent.location.lat, newEvent.location.lng]} />
                             </MapContainer>
                             <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg z-[1000] border border-slate-100 flex items-center justify-between">
                               <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                 <Crosshair size={12} /> Tap map to set pin
                                </span>
                               <span className="text-[10px] font-bold text-emerald-600">
                                 {newEvent.location.lat.toFixed(4)}, {newEvent.location.lng.toFixed(4)}
                               </span>
                             </div>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                       <input 
                         required
                         type="date"
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500" 
                         value={newEvent.date}
                         onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time</label>
                       <input 
                         required
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500" 
                         value={newEvent.time}
                         onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                         placeholder="10:00 AM - 12:00 PM"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                     <textarea 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 h-24" 
                       value={newEvent.description}
                       onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                       placeholder="Join us for a community cleaning drive..."
                     />
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Event Status</label>
                     <div className="flex gap-4">
                       {(['upcoming', 'completed'] as const).map((status) => (
                         <button
                           key={status}
                           type="button"
                           onClick={() => setNewEvent({ ...newEvent, status })}
                           className={cn(
                             "px-4 py-2 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider",
                             newEvent.status === status
                               ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                               : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
                           )}
                         >
                           {status}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Things to Bring (Multi-select)</label>
                     <div className="flex flex-wrap gap-2">
                       {EVENT_THINGS_OPTIONS.map(option => (
                         <button
                           key={option}
                           type="button"
                           onClick={() => toggleThing('thingsToBring', option)}
                           className={cn(
                             "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                             newEvent.thingsToBring.includes(option)
                               ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                               : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
                           )}
                         >
                           {option}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Things Provided (Multi-select)</label>
                     <div className="flex flex-wrap gap-2">
                       {EVENT_THINGS_OPTIONS.map(option => (
                         <button
                           key={option}
                           type="button"
                           onClick={() => toggleThing('thingsProvided', option)}
                           className={cn(
                             "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                             newEvent.thingsProvided.includes(option)
                               ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                               : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
                           )}
                         >
                           {option}
                         </button>
                       ))}
                     </div>
                   </div>
                   <button type="submit" className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95">
                     {editingEventId ? 'Update Event' : 'Publish Event'}
                   </button>
                 </form>
               </motion.div>
             </div>
          )}
        </AnimatePresence>

        {/* Modal for New Article */}
        <AnimatePresence>
          {isArticleModalOpen && (
             <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[32px] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-8"
               >
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Article</h2>
                   <button onClick={() => setIsArticleModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={20} />
                   </button>
                 </div>
                 <form onSubmit={handleCreateArticle} className="space-y-6">
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Title</label>
                     <input 
                       required
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-bold text-xl focus:ring-2 focus:ring-emerald-500" 
                       value={newArticle.title}
                       onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                       placeholder="The impact of littering on our oceans"
                     />
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                     <input 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500" 
                       value={newArticle.category}
                       onChange={e => setNewArticle({...newArticle, category: e.target.value})}
                       placeholder="Environment / Awareness"
                     />
                   </div>
                   <div>
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Content</label>
                     <textarea 
                       required
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 h-48" 
                       value={newArticle.content}
                       onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                       placeholder="Write your article here..."
                     />
                   </div>
                   <button type="submit" className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95">
                     Publish Article
                   </button>
                 </form>
               </motion.div>
             </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
