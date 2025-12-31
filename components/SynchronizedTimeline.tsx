
import React, { useRef, useEffect, useState } from 'react';
import { CalendarEvent, Location } from '../types';
import { generate30MinSlots, formatTimeOnly, formatFullDate, isSameDay } from '../utils/timeUtils';

interface SynchronizedTimelineProps {
  myEvents: CalendarEvent[];
  partnerEvents: CalendarEvent[];
  myLocation: Location;
  partnerLocation: Location;
  currentUser: 'me' | 'partner';
  selectedDate: Date;
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
}

const SynchronizedTimeline: React.FC<SynchronizedTimelineProps> = ({ 
  myEvents, 
  partnerEvents, 
  myLocation, 
  partnerLocation,
  currentUser,
  selectedDate,
  onAddTask,
  onDeleteTask
}) => {
  const slots = generate30MinSlots(selectedDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const slotWidth = 100;

  const scrollToNow = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const isToday = isSameDay(selectedDate, new Date());
      let hourToFocus = 8; // Default view for non-today dates
      let minuteOffset = 0;

      if (isToday) {
        const now = new Date();
        hourToFocus = now.getUTCHours();
        minuteOffset = now.getUTCMinutes();
      }

      const totalMinutes = hourToFocus * 60 + minuteOffset;
      // Positioning "Now" at the left end
      const scrollPos = (totalMinutes / 30) * slotWidth;
      scrollRef.current.scrollTo({ left: scrollPos, behavior });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => scrollToNow('smooth'), 100);
    return () => clearTimeout(timeout);
  }, [selectedDate]);

  const getEventInSlot = (events: CalendarEvent[], slotStart: Date) => {
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
    return events.find(e => {
      const eStart = new Date(e.startTime);
      const eEnd = new Date(eStart.getTime() + e.durationMinutes * 60000);
      return Math.max(eStart.getTime(), slotStart.getTime()) < Math.min(eEnd.getTime(), slotEnd.getTime());
    });
  };

  const getSlotColor = (type: string, isPartner: boolean) => {
    if (isPartner) {
      switch(type) {
        case 'work': return 'bg-rose-600';
        case 'sleep': return 'bg-slate-700';
        case 'date': return 'bg-pink-600';
        default: return 'bg-rose-400';
      }
    }
    switch(type) {
      case 'work': return 'bg-pink-600';
      case 'sleep': return 'bg-indigo-900';
      case 'date': return 'bg-rose-500';
      default: return 'bg-pink-400';
    }
  };

  const topLabel = currentUser === 'me' ? 'Seoul' : 'Georgia';
  const bottomLabel = currentUser === 'me' ? 'Georgia' : 'Seoul';
  const topIcon = currentUser === 'me' ? 'fa-user' : 'fa-heart';
  const bottomIcon = currentUser === 'me' ? 'fa-heart' : 'fa-user';
  const topColor = currentUser === 'me' ? 'text-pink-600' : 'text-rose-500'; 
  const bottomColor = currentUser === 'me' ? 'text-rose-500' : 'text-pink-600'; 

  const isViewingToday = isSameDay(selectedDate, new Date());
  
  const getNowLineLeft = () => {
    const hours = currentTime.getUTCHours();
    const minutes = currentTime.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 30) * slotWidth;
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden transition-all duration-500">
      <div className="flex bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-pink-50">
            <i className="fa-solid fa-clock text-pink-500 text-xs"></i>
          </div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-tight">{formatFullDate(selectedDate)}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isViewingToday && (
            <button 
              onClick={() => scrollToNow('smooth')}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-location-crosshairs"></i>
              Sync Now
            </button>
          )}
          <button 
            onClick={onAddTask}
            className="px-4 py-1.5 bg-pink-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-pink-100 hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            Add Task
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-x-auto custom-scrollbar relative select-none cursor-grab active:cursor-grabbing scroll-smooth"
      >
        <div className="flex min-w-max p-6 pt-10 relative">
          
          {isViewingToday && (
            <div 
              className="absolute top-0 bottom-0 z-40 w-[2px] bg-red-500 pointer-events-none transition-all duration-1000"
              style={{ left: `calc(${getNowLineLeft()}px + 6rem + 1rem)` }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase shadow-md">
                Now
              </div>
              <div className="absolute -left-[3px] top-[10rem] w-2 h-2 rounded-full bg-red-500 shadow-md"></div>
            </div>
          )}

          <div className="sticky left-0 z-30 bg-white/95 backdrop-blur-sm pr-4 border-r border-gray-100 flex flex-col justify-center gap-12 py-4 mr-2">
             <div className="flex flex-col items-center">
                <span className={`text-[8px] font-black ${topColor} uppercase mb-1`}>{topLabel}</span>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gray-50 ${topColor} shadow-sm border border-gray-100`}>
                  <i className={`fa-solid ${topIcon} text-[10px]`}></i>
                </div>
             </div>
             <div className="flex flex-col items-center">
                <span className={`text-[8px] font-black ${bottomColor} uppercase mb-1`}>{bottomLabel}</span>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gray-50 ${bottomColor} shadow-sm border border-gray-100`}>
                  <i className={`fa-solid ${bottomIcon} text-[10px]`}></i>
                </div>
             </div>
          </div>

          {slots.map((slot, idx) => {
            const myEvent = getEventInSlot(myEvents, slot);
            const partnerEvent = getEventInSlot(partnerEvents, slot);
            
            const topEvent = currentUser === 'me' ? myEvent : partnerEvent;
            const bottomEvent = currentUser === 'me' ? partnerEvent : myEvent;
            const isTopPartner = currentUser !== 'me';
            const isBottomPartner = currentUser === 'me';
            
            const topTimeLabel = formatTimeOnly(slot, currentUser === 'me' ? myLocation : partnerLocation);
            const bottomTimeLabel = formatTimeOnly(slot, currentUser === 'me' ? partnerLocation : myLocation);
            
            const now = currentTime;
            const isCurrentSlot = isViewingToday && 
              slot.getUTCHours() === now.getUTCHours() && 
              Math.floor(slot.getUTCMinutes() / 30) === Math.floor(now.getUTCMinutes() / 30);

            return (
              <div key={idx} className={`flex flex-col items-center relative transition-colors duration-300 ${isCurrentSlot ? 'bg-pink-50/10' : ''}`} style={{ width: slotWidth }}>
                <div className={`text-[10px] font-black mb-3 transition-colors ${isCurrentSlot ? 'text-pink-600 scale-110' : 'text-gray-600'}`}>
                  {topTimeLabel}
                </div>
                
                <div className="w-full h-16 px-1 mb-4 group z-10">
                  <div 
                    onClick={() => topEvent && onDeleteTask(topEvent.id)}
                    className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 ${topEvent ? `${getSlotColor(topEvent.type, isTopPartner)} text-white shadow-sm scale-105 z-10 cursor-pointer hover:brightness-110 active:scale-95` : 'bg-gray-50/50 border border-dashed border-gray-200 group-hover:border-pink-200'}`}
                  >
                    {topEvent ? (
                      <div className="flex flex-col items-center p-1 text-center">
                        <span className="text-[7px] font-black uppercase tracking-tight leading-tight line-clamp-2">{topEvent.title}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="w-full border-t border-gray-200 mb-4 relative h-[1px]">
                   {slot.getUTCMinutes() === 0 && (
                     <div className="absolute top-0 left-0 w-[1px] h-1.5 bg-gray-300 -translate-y-0.75"></div>
                   )}
                </div>

                <div className="w-full h-16 px-1 mb-4 group z-10">
                  <div 
                    onClick={() => bottomEvent && onDeleteTask(bottomEvent.id)}
                    className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 ${bottomEvent ? `${getSlotColor(bottomEvent.type, isBottomPartner)} text-white shadow-sm scale-105 z-10 cursor-pointer hover:brightness-110 active:scale-95` : 'bg-gray-50/50 border border-dashed border-gray-200 group-hover:border-rose-200'}`}
                  >
                    {bottomEvent ? (
                      <div className="flex flex-col items-center p-1 text-center">
                        <span className="text-[7px] font-black uppercase tracking-tight leading-tight line-clamp-2">{bottomEvent.title}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={`text-[10px] font-black transition-colors ${isCurrentSlot ? 'text-rose-600 scale-110' : 'text-gray-600'}`}>
                  {bottomTimeLabel}
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gray-100 -z-10"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SynchronizedTimeline;
