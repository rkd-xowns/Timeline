
import React, { useState, useEffect } from 'react';
import { Location, CalendarEvent, DailyHighlight, DailyFeeling } from './types';
import { getTimeInZone } from './utils/timeUtils';
import SynchronizedTimeline from './components/SynchronizedTimeline';
import EventModal from './components/EventModal';
import CalendarPicker from './components/CalendarPicker';
import FeelingSection from './components/FeelingSection';

const PRESET_COLORS = [
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Violet', hex: '#8b5cf6' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<'me' | 'partner'>('me');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [highlights, setHighlights] = useState<Record<string, DailyHighlight>>({});
  const [feelings, setFeelings] = useState<DailyFeeling[]>([]);
  const [isEditingHighlight, setIsEditingHighlight] = useState(false);
  const [tempHighlightTitle, setTempHighlightTitle] = useState('');
  const [tempHighlightColor, setTempHighlightColor] = useState(PRESET_COLORS[0].hex);

  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Work', startTime: new Date().toISOString(), durationMinutes: 480, type: 'work', userId: 'me' },
    { id: '2', title: 'Sleep', startTime: new Date(Date.now() - 28800000).toISOString(), durationMinutes: 480, type: 'sleep', userId: 'me' },
    { id: '3', title: 'Dinner', startTime: new Date().toISOString(), durationMinutes: 60, type: 'leisure', userId: 'partner' }
  ]);

  const [times, setTimes] = useState({
    korea: getTimeInZone(Location.KOREA),
    georgia: getTimeInZone(Location.GEORGIA)
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimes({
        korea: getTimeInZone(Location.KOREA),
        georgia: getTimeInZone(Location.GEORGIA)
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddEvent = (eventData: any) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      userId: currentUser
    };
    setAllEvents([...allEvents, newEvent]);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Delete this task?')) {
      setAllEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleAddFeeling = (text: string, emoji: string) => {
    const newFeeling: DailyFeeling = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser,
      text,
      emoji,
      timestamp: new Date().toISOString(),
      dateKey: getDateKey(selectedDate)
    };
    setFeelings([...feelings, newFeeling]);
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const saveHighlight = () => {
    const key = getDateKey(selectedDate);
    setHighlights({
      ...highlights,
      [key]: {
        dateKey: key,
        title: tempHighlightTitle || 'Main Event',
        color: tempHighlightColor
      }
    });
    setIsEditingHighlight(false);
  };

  const openHighlightEditor = () => {
    const key = getDateKey(selectedDate);
    const existing = highlights[key];
    setTempHighlightTitle(existing?.title || '');
    setTempHighlightColor(existing?.color || PRESET_COLORS[0].hex);
    setIsEditingHighlight(true);
  };

  const myEvents = allEvents.filter(e => e.userId === 'me');
  const partnerEvents = allEvents.filter(e => e.userId === 'partner');
  const currentFeelings = feelings.filter(f => f.dateKey === getDateKey(selectedDate));

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const currentHighlight = highlights[getDateKey(selectedDate)];

  return (
    <div className="min-h-screen pb-12 bg-[#fffafa]">
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-pink-100 shadow-sm flex scale-90 sm:scale-100 origin-left">
            <button 
              onClick={() => setCurrentUser('me')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ${currentUser === 'me' ? 'bg-pink-500 text-white shadow-md shadow-pink-100' : 'text-gray-400 hover:bg-pink-50'}`}
            >
              <i className="fa-solid fa-user"></i>
              Mine
            </button>
            <button 
              onClick={() => setCurrentUser('partner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ${currentUser === 'partner' ? 'bg-rose-400 text-white shadow-md shadow-rose-100' : 'text-gray-400 hover:bg-pink-50'}`}
            >
              <i className="fa-solid fa-heart"></i>
              Hers
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 bg-pink-50/50 p-1.5 rounded-xl border border-pink-100">
            <div className="flex items-center gap-1.5 px-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-pink-300 leading-none">Seoul</span>
                <span className="text-xs font-mono font-bold text-gray-700">{times.korea}</span>
              </div>
            </div>
            <div className="h-4 w-[1px] bg-pink-200"></div>
            <div className="flex items-center gap-1.5 px-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-rose-300 leading-none">Georgia</span>
                <span className="text-xs font-mono font-bold text-gray-700">{times.georgia}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-pink-50">
            <button 
              onClick={() => changeDate(-1)}
              className="w-8 h-8 rounded-full hover:bg-pink-50 text-pink-400 transition-colors flex items-center justify-center"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="flex flex-col items-center px-4 py-1 rounded-xl hover:bg-pink-50 transition-colors group"
            >
               <span className="text-[9px] font-black text-pink-300 uppercase tracking-widest group-hover:text-pink-500 leading-none mb-1">Date</span>
               <div className="flex items-center gap-1.5">
                 <h2 className="text-sm font-black text-gray-800">
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                 </h2>
                 <i className="fa-solid fa-calendar-days text-pink-400 text-xs group-hover:scale-110 transition-transform"></i>
               </div>
            </button>
            <button 
              onClick={() => changeDate(1)}
              className="w-8 h-8 rounded-full hover:bg-pink-50 text-pink-400 transition-colors flex items-center justify-center"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          <div className="flex flex-col items-center">
            {currentHighlight ? (
              <button 
                onClick={openHighlightEditor}
                className="group flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: currentHighlight.color, backgroundColor: `${currentHighlight.color}10` }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentHighlight.color }}></div>
                <div className="flex flex-col items-start">
                   <span className="text-[8px] font-black uppercase opacity-60 tracking-widest leading-none" style={{ color: currentHighlight.color }}>Main Event</span>
                   <span className="text-xs font-black text-gray-800">{currentHighlight.title}</span>
                </div>
                <i className="fa-solid fa-pen text-[9px] opacity-0 group-hover:opacity-40 transition-opacity"></i>
              </button>
            ) : (
              <button 
                onClick={openHighlightEditor}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-400 text-[10px] font-bold hover:border-pink-300 hover:text-pink-400 transition-all hover:bg-white"
              >
                <i className="fa-solid fa-plus-circle"></i>
                Set Day Theme
              </button>
            )}
          </div>
        </div>

        <SynchronizedTimeline 
          myEvents={myEvents}
          partnerEvents={partnerEvents}
          myLocation={Location.KOREA}
          partnerLocation={Location.GEORGIA}
          currentUser={currentUser}
          selectedDate={selectedDate}
          onAddTask={() => setIsModalOpen(true)}
          onDeleteTask={handleDeleteEvent}
        />

        <FeelingSection 
          feelings={currentFeelings} 
          onAddFeeling={handleAddFeeling}
          currentUser={currentUser}
          myLocation={Location.KOREA}
          partnerLocation={Location.GEORGIA}
        />
      </main>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddEvent}
        userLocation={currentUser === 'me' ? Location.KOREA : Location.GEORGIA}
        selectedDate={selectedDate}
      />

      {isCalendarOpen && (
        <CalendarPicker 
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
          }}
          onClose={() => setIsCalendarOpen(false)}
          highlights={highlights}
        />
      )}

      {isEditingHighlight && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-800">Set Day Theme</h3>
                  <button onClick={() => setIsEditingHighlight(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="fa-solid fa-times text-lg"></i>
                  </button>
                </div>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Event Title</label>
                    <input 
                      type="text" 
                      value={tempHighlightTitle}
                      onChange={(e) => setTempHighlightTitle(e.target.value)}
                      placeholder="e.g. Flight, Birthday, Date Night..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-pink-50 focus:border-pink-300 outline-none transition-all font-bold text-sm text-gray-700"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Color Theme</label>
                    <div className="grid grid-cols-7 gap-2">
                      {PRESET_COLORS.map(color => (
                        <button 
                          key={color.hex}
                          onClick={() => setTempHighlightColor(color.hex)}
                          className={`w-full aspect-square rounded-lg transition-all flex items-center justify-center ${tempHighlightColor === color.hex ? 'scale-110 shadow-md ring-2 ring-offset-1 ring-gray-100' : 'opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {tempHighlightColor === color.hex && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button 
                    onClick={() => setIsEditingHighlight(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveHighlight}
                    className="flex-1 px-4 py-3 rounded-xl bg-pink-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all active:scale-95"
                  >
                    Save
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
