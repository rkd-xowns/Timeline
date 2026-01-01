
import { CalendarEvent, DailyHighlight, DailyFeeling } from '../types';

const API_BASE = 'https://jsonblob.com/api/jsonBlob';

export interface SharedData {
  events: CalendarEvent[];
  highlights: Record<string, DailyHighlight>;
  feelings: DailyFeeling[];
  names: {
    me: string;
    partner: string;
  };
  lastUpdated: string;
}

// We use a fixed project ID in JSONBlob or similar. 
// For this app, we'll use a hardcoded blob ID for the couple.
// In a real production app, this would be a specific user record.
const FIXED_BLOB_ID = '1342551403217469440'; 

export const updateBridge = async (code: string, data: SharedData): Promise<void> => {
  try {
    await fetch(`${API_BASE}/${FIXED_BLOB_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error('Update Error:', err);
  }
};

export const getBridgeData = async (code: string): Promise<SharedData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${FIXED_BLOB_ID}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Fetch Error:', err);
    return null;
  }
};

// Placeholder for logic if we ever needed to recreate it
export const createBridge = async (data: SharedData): Promise<string> => {
  return FIXED_BLOB_ID;
};

export const mergeData = (local: any[], remote: any[]) => {
  const combined = [...local];
  remote.forEach(remoteItem => {
    if (!combined.find(localItem => localItem.id === remoteItem.id)) {
      combined.push(remoteItem);
    }
  });
  // Sort by time
  return combined;
};
