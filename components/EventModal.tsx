
import React, { useState } from 'react';
import { Location } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: any) => void;
  userLocation: Location;
  selectedDate: Date;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, userLocation, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startHour, setStartHour] = useState('09');
  const [startMin, setStartMin] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMin, setEndMin] = useState('00');
  const [type, setType] = useState<'work' | 'sleep' | 'leisure' | 'date' | 'other'>('work');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate UTC startTime
    const startTimeUTC = new Date(selectedDate);
    startTimeUTC.setUTCHours(parseInt(startHour, 10), parseInt(startMin, 10), 0, 0);

    const endTimeUTC = new Date(selectedDate);
    endTimeUTC.setUTCHours(parseInt(endHour, 10), parseInt(endMin, 10), 0, 0);

    // If end time is before start time, assume it ends the next day
    if (endTimeUTC <= startTimeUTC) {
      endTimeUTC.setUTCDate(endTimeUTC.getUTCDate() + 1);
    }

    const durationMinutes = (endTimeUTC.getTime() - startTimeUTC.getTime()) / 60000;
    
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      title: title || 'New Task',
      startTime: startTimeUTC.toISOString(),
      durationMinutes,
      type
    });
    
    setTitle('');
    onClose();
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '30'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-8">
          <h2 className="text-white text-2xl font-black flex items-center gap-3 italic">
            <i className="fa-solid fa-plus-circle"></i>
            PLAN ACTIVITY
          </h2>
          <p className="text-pink-100 text-xs mt-2 font-bold uppercase tracking-widest opacity-80">
            For {selectedDate.toLocaleDateString()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">What's the plan?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Session, Gym, Movie Night"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-gray-700"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From (UTC)</label>
              <div className="flex gap-2">
                <select 
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select 
                  value={startMin}
                  onChange={(e) => setStartMin(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To (UTC)</label>
              <div className="flex gap-2">
                {/* Fix: Removed redundant hidden select and correctly set onChange to setEndHour */}
                <select 
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select 
                  value={endMin}
                  onChange={(e) => setEndMin(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {(['work', 'sleep', 'leisure', 'date', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setType(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === cat ? 'bg-pink-500 text-white shadow-lg shadow-pink-100 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {cat === 'date' ? 'Date ❤️' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
