import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useDragControls, AnimatePresence } from 'motion/react';
import { Camera, MapPin, Mic, MessageSquare, Leaf, Recycle, AlertTriangle, Zap, Shirt, Syringe, Home, FlaskConical, ChevronRight, X, Check, MapPinOff, Share2, CornerUpRight, Play, Square, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import Webcam from 'react-webcam';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

// Fix for default leaflet marker icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const types = [
  { id: 'organic', label: 'Organic', icon: Leaf },
  { id: 'recyclable', label: 'Recyclable', icon: Recycle },
  { id: 'hazardous', label: 'Hazardous', icon: AlertTriangle },
  { id: 'electronic', label: 'Electronic', icon: Zap },
  { id: 'cloth', label: 'Cloth', icon: Shirt },
  { id: 'medical', label: 'Medical', icon: Syringe },
  { id: 'rubble', label: 'Rubble', icon: Home },
  { id: 'chemical', label: 'Chemical', icon: FlaskConical },
];

const quantities = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

export default function ReportLitter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dragControls = useDragControls();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<string | null>(null);
  
  const [activeModal, setActiveModal] = useState<'photo' | 'locate' | 'voice' | 'comment' | 'summary' | 'success' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for captured data
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  const handleConfirmUpload = async () => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        authorUID: user.uid,
        type: selectedTypes.join(', '),
        quantity: selectedQuantity || 'not-specified',
        location: {
          lat: location?.lat,
          lng: location?.lng,
          address: "Vasco da Gama Square, Fort Kochi"
        },
        comment: comment,
        voiceText: voiceText,
        photos: photos,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setActiveModal('success');
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Webcam ref
  const webcamRef = useRef<Webcam>(null);

  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setVoiceText(prev => (prev ? prev + ' ' : '') + finalTranscript);
        }
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhotos(prev => [...prev, imageSrc]);
      setShowValidationWarning(false); // clear warning if they fix it
    }
  }, [webcamRef]);

  const getLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          setShowValidationWarning(false); // clear warning if they fix it
        },
        (error) => {
          console.error("Error getting location", error);
          let errorMessage = "Could not get your location.";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable it in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out.";
              break;
          }
          setLocationError(errorMessage);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmitClick = () => {
    // Check required fields
    if (photos.length === 0 || !location) {
      setShowValidationWarning(true);
      // Optional: auto-scroll to top or show toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveModal('summary');
  };

  const handleNavigate = () => {
    const lat = location?.lat || 9.958491;
    const lng = location?.lng || 76.239932;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handlePlayVoice = () => {
    if (!voiceText) return;
    
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      setIsPlayingVoice(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Map updater component
  function MapUpdater({ center }: { center: {lat: number, lng: number} }) {
    const map = useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });

    useEffect(() => {
      map.setView([center.lat, center.lng], map.getZoom());
    }, [center, map]);
    return null;
  }

  const renderModal = () => {
    return (
      <AnimatePresence>
        {activeModal === 'summary' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150 || info.velocity.y > 500) {
                  setActiveModal(null);
                }
              }}
              className="bg-white rounded-t-[32px] flex flex-col max-h-[90vh] shadow-xl relative"
            >
              {/* Handle Area - Drag Trigger */}
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="flex flex-col items-center pt-4 pb-2 cursor-grab active:cursor-grabbing touch-none relative z-20"
              >
                <div className="w-16 h-1.5 bg-slate-300 rounded-full mb-3"></div>
                <div className="px-4 pb-1 flex items-center relative w-full">
                  <h2 className="text-xl font-bold text-slate-900 w-full text-center select-none">Summary</h2>
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors pointer-events-auto"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pb-24 flex flex-col gap-6 max-w-md mx-auto w-full">
                {/* Photo */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 text-lg">Photos</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                    {photos.length > 0 ? (
                      photos.map((p, idx) => (
                        <img key={idx} src={p} alt={`Captured ${idx + 1}`} className="w-[200px] h-[140px] rounded-xl object-cover shrink-0 shadow-[0_2px_8px_rgb(0,0,0,0.08)]" />
                      ))
                    ) : (
                      <div className="w-[200px] h-[140px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm border border-slate-200">No Photo</div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 text-lg">Location</h3>
                  <div className="bg-white border text-sm border-slate-100 rounded-2xl p-3 flex gap-3 shadow-[0_2px_8px_rgb(0,0,0,0.04)] items-center">
                    {photos.length > 0 ? (
                      <img src={photos[0]} className="w-16 h-16 rounded-lg object-cover shrink-0" alt="Location thumbnail" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-emerald-100 shrink-0 flex items-center justify-center text-emerald-500"><MapPin size={24} /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">Vasco da Gama Square</h4>
                      <p className="text-[11px] text-slate-500 truncate">Fort Kochi, Kochi, Kerala 682001</p>
                      <div className="h-[1px] bg-slate-100 my-1.5"></div>
                      <p className="text-[#059669] font-medium text-[13px] truncate">
                        {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "9.958491, 76.239932"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 border-l border-slate-100 pl-3 justify-center">
                      <button onClick={handleNavigate} className="bg-[#0ea5e9] text-white p-2 rounded-xl hover:bg-[#0284c7] transition-colors"><CornerUpRight size={24} /></button>
                    </div>
                  </div>
                </div>

                {/* Speak Up */}
                {voiceText && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Speak Up</h3>
                    <div 
                      className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-colors cursor-pointer hover:bg-slate-50"
                      onClick={handlePlayVoice}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-all", 
                        isPlayingVoice ? "bg-red-500 animate-pulse scale-95" : "bg-[#34d399]"
                      )}>
                        {isPlayingVoice ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                      </div>
                      <div className="flex-1 flex items-center gap-[3px] h-10 overflow-hidden justify-center pl-2">
                         {/* Static waveform to match mockup */}
                         {Array.from({length: 45}).map((_, i) => (
                           <div key={i} className={cn("w-[2px] rounded-full bg-[#059669] transition-all duration-75", isPlayingVoice ? "opacity-100" : "opacity-70")} style={{ height: `${Math.max(10, Math.sin(i * 0.5) * 60 + (isPlayingVoice ? Math.random() * 40 : 20))}%`}}></div>
                         ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 italic px-2">"{voiceText}"</p>
                  </div>
                )}

                {/* Comment */}
                {comment && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Comment</h3>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[15px] text-slate-600 leading-relaxed">
                      {comment}
                    </div>
                  </div>
                )}

                {/* Types */}
                {selectedTypes.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTypes.map(typeId => {
                        const typeConf = types.find(t => t.id === typeId);
                        return typeConf ? (
                          <div key={typeId} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide uppercase flex items-center gap-1.5">
                            <typeConf.icon size={16} strokeWidth={2.5} />
                            {typeConf.label}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {selectedQuantity && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Quantity</h3>
                    <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold tracking-wide uppercase inline-block">
                      {quantities.find(q => q.id === selectedQuantity)?.label || selectedQuantity}
                    </div>
                  </div>
                )}

              </div>
              
              {/* Fixed Bottom Button for Summary */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] rounded-b-[32px]">
                <div className="max-w-md mx-auto">
                  <button 
                    disabled={isSubmitting}
                    onClick={handleConfirmUpload} 
                    className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Uploading...
                      </>
                    ) : 'Confirm & Upload'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {activeModal === 'success' && (
          <div className="fixed inset-0 bg-white z-[60] flex flex-col">
            {/* Header */}
            <header className="bg-[#0F6B59] text-white px-4 md:px-8 py-4 flex items-center shadow-md">
              <button onClick={() => navigate('/')} className="p-1">
                <Home size={24} />
              </button>
              <h1 className="text-xl font-medium text-center flex-1 pr-6">Congratulations</h1>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
              
              {/* Illustration */}
              <div className="w-full relative h-[300px] mb-8 flex justify-center items-center">
                <img 
                  src="/reward-image.png" 
                  alt="Rewards and Gifts" 
                  className="max-w-[280px] w-full h-full object-contain"
                />
              </div>

              <h2 className="text-[#0F6B59] text-[40px] font-bold mb-3 tracking-tight">Congrats!!!</h2>
              <p className="text-[20px] text-black font-medium tracking-wide">You earned 10 Points</p>
            </div>
            
            {/* Footer Button */}
            <div className="p-6 max-w-md mx-auto w-full pb-10">
              <button 
                onClick={() => navigate('/rewards')} 
                className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
              >
                Redeem
              </button>
            </div>
          </div>
        )}

        {!['summary', 'success'].includes(activeModal as string) && activeModal && (
          <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 capitalize">{activeModal}</h2>
              <button onClick={() => {
                if (isListening) toggleListening();
                setActiveModal(null);
              }} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col max-w-md mx-auto w-full">
              {activeModal === 'photo' && (
                <div className="flex flex-col h-full gap-4">
                  <div className="flex-1 relative rounded-[32px] overflow-hidden border-4 border-white shadow-md bg-black">
                    {/* @ts-ignore - react-webcam types are overly strict in this version */}
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {photos.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                      {photos.map((p, i) => (
                        <div key={i} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                          <img src={p} alt={`Captured ${i}`} className="w-full h-full object-cover" />
                          <button onClick={(e) => { e.stopPropagation(); setPhotos(prev => prev.filter((_, index) => index !== i)); }} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white backdrop-blur-sm shadow-sm transition-colors cursor-pointer z-10">
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-auto pt-2 shrink-0">
                    <button onClick={capturePhoto} className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-[24px] font-bold shadow-sm hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center justify-center gap-2">
                      <Camera size={24} /> Capture
                    </button>
                    <button onClick={() => {
                      if (!location) {
                        setActiveModal('locate');
                      } else {
                        setActiveModal(null);
                      }
                    }} className="flex-1 py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center">
                      Done {photos.length > 0 ? `(${photos.length})` : ''}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'locate' && (
                <div className="flex flex-col h-full gap-4">
                  <div className="flex-1 rounded-[32px] overflow-hidden border-4 border-white shadow-md relative bg-slate-100">
                    {location ? (
                      <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker 
                          position={[location.lat, location.lng]} 
                          draggable={true}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              setLocation({ lat: position.lat, lng: position.lng });
                            }
                          }}
                        />
                        <MapUpdater center={location} />
                      </MapContainer>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 p-6 text-center">
                        {isLocating ? (
                          <>
                            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="font-medium text-slate-600">Finding your location...</p>
                          </>
                        ) : locationError ? (
                          <>
                            <AlertTriangle size={48} className="text-red-400" />
                            <p className="font-medium text-red-500">{locationError}</p>
                            <p className="text-sm text-slate-500 mt-2">Please check your browser permissions.</p>
                          </>
                        ) : (
                          <>
                            <MapPinOff size={48} className="opacity-50" />
                            <p className="font-medium">Location not set</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-auto pt-4">
                    <button 
                      onClick={getLocation} 
                      disabled={isLocating}
                      className={cn(
                        "w-full py-4 rounded-[24px] font-bold flex items-center justify-center gap-2 shadow-md transition-colors",
                        isLocating ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-slate-800 text-white hover:bg-slate-700"
                      )}
                    >
                      <MapPin size={20} /> {isLocating ? 'Locating...' : (location ? 'Update Location' : 'Get Current Location')}
                    </button>
                    {location && (
                      <button onClick={() => {
                        if (photos.length === 0) {
                          setActiveModal('photo');
                        } else {
                          setActiveModal(null);
                        }
                      }} className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md">
                        Done
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeModal === 'voice' && (
                <div className="flex flex-col h-full gap-8 items-center justify-center py-8">
                  <div className="w-full bg-white p-6 rounded-[32px] border border-slate-200 min-h-[250px] shadow-sm flex flex-col">
                    <p className={cn("text-lg leading-relaxed flex-1", voiceText ? "text-slate-800" : "text-slate-400 italic")}>
                      {voiceText || "Tap the microphone and start speaking to describe the litter..."}
                    </p>
                    {voiceText && (
                      <button onClick={() => setVoiceText('')} className="text-sm text-red-500 font-medium self-end mt-4 hover:underline">Clear</button>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <button 
                      onClick={toggleListening} 
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
                        isListening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-emerald-500 text-white hover:bg-emerald-600"
                      )}
                    >
                      <Mic size={40} />
                    </button>
                    <p className="text-slate-500 font-medium">{isListening ? "Listening..." : "Tap to speak"}</p>
                  </div>
                  
                  <button onClick={() => {
                    if (isListening) toggleListening();
                    setActiveModal(null);
                  }} className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md mt-auto">
                    Done
                  </button>
                </div>
              )}

              {activeModal === 'comment' && (
                <div className="flex flex-col h-full gap-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add any additional details about the litter here..."
                    className="flex-1 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-lg"
                  />
                  <button onClick={() => setActiveModal(null)} className="w-full py-4 rounded-[100px] font-bold text-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md mt-auto">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-slate-50">
      <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
        
        {/* Validation Warning */}
        {showValidationWarning && (photos.length === 0 || !location) && (
          <div className="bg-red-50 text-red-600 p-4 rounded-[16px] border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">Please add a photo and location to submit your report.</p>
          </div>
        )}

        {/* Action Buttons */}
        <button onClick={() => setActiveModal('photo')} className={cn("bg-white p-5 rounded-[24px] border shadow-sm flex items-center justify-between transition-colors", showValidationWarning && photos.length === 0 ? "border-red-300" : "border-slate-200 hover:border-emerald-500")}>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", photos.length > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>
              <Camera size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg text-slate-800 font-bold">Take Photos <span className="text-red-500 ml-1">*</span></span>
              {photos.length > 0 ? <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1">{photos.length} Photo{photos.length !== 1 ? 's' : ''} captured</span> : <span className="text-[11px] text-slate-400 font-medium tracking-wide">Required</span>}
            </div>
          </div>
          {photos.length > 0 ? <Check className="text-emerald-500" size={24} /> : <ChevronRight className="text-slate-400" size={24} />}
        </button>

        <button onClick={() => setActiveModal('locate')} className={cn("bg-white p-5 rounded-[24px] border shadow-sm flex items-center justify-between transition-colors", showValidationWarning && !location ? "border-red-300" : "border-slate-200 hover:border-emerald-500")}>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", location ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>
              <MapPin size={24} />
            </div>
            <div className="flex flex-col items-start">
               <span className="text-lg text-slate-800 font-bold">Locate <span className="text-red-500 ml-1">*</span></span>
               {location ? <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1">Location set</span> : <span className="text-[11px] text-slate-400 font-medium tracking-wide">Required</span>}
            </div>
          </div>
          {location ? <Check className="text-emerald-500" size={24} /> : <ChevronRight className="text-slate-400" size={24} />}
        </button>

        <button onClick={() => setActiveModal('voice')} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", voiceText ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>
              <Mic size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg text-slate-800 font-bold">Speak up</span>
              {voiceText && <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1 truncate max-w-[150px]">{voiceText}</span>}
            </div>
          </div>
          {voiceText ? <Check className="text-emerald-500" size={24} /> : <ChevronRight className="text-slate-400" size={24} />}
        </button>

        <button onClick={() => setActiveModal('comment')} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", comment ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>
              <MessageSquare size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg text-slate-800 font-bold">Comment</span>
              {comment && <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1 truncate max-w-[150px]">{comment}</span>}
            </div>
          </div>
          {comment ? <Check className="text-emerald-500" size={24} /> : <ChevronRight className="text-slate-400" size={24} />}
        </button>

        {/* Select Type */}
        <div className="mt-4">
          <h3 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center justify-between">
            <span>Select Type</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full normal-case">Select multiple</span>
          </h3>
          <div className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="grid grid-cols-4 gap-4">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-colors relative",
                    selectedTypes.includes(type.id) 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600" 
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-emerald-200"
                  )}>
                    <type.icon size={24} strokeWidth={1.5} />
                    {selectedTypes.includes(type.id) && (
                      <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", selectedTypes.includes(type.id) ? "text-emerald-600" : "text-slate-500")}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Select Quantity */}
        <div className="mt-4 mb-4">
          <h3 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Select Quantity</h3>
          <div className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              {quantities.map((qty) => (
                <button
                  key={qty.id}
                  onClick={() => setSelectedQuantity(qty.id)}
                  className={cn(
                    "py-3 rounded-2xl border-2 text-sm font-bold transition-colors",
                    selectedQuantity === qty.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-emerald-200"
                  )}
                >
                  {qty.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
      
      {/* Submit Button (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-md mx-auto relative cursor-pointer" onClick={handleSubmitClick}>
          <button 
            disabled={showValidationWarning && (photos.length === 0 || !location)}
            className={cn(
               "w-full py-4 rounded-[100px] font-bold text-lg transition-colors shadow-md pointer-events-none",
               (showValidationWarning && (photos.length === 0 || !location)) 
                  ? "bg-slate-300 text-slate-500" 
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
            )}
          >
            Submit Report
          </button>
        </div>
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );
}
