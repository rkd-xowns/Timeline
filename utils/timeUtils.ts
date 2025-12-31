
import { Location } from '../types';

export const getTimeInZone = (zone: Location) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
};

export const getHourInZoneAtUTC = (utcDate: Date, zone: Location) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(utcDate), 10);
};

// Generates an array of 48 Date objects starting from the beginning of the selected day in UTC (every 30 mins)
export const generate30MinSlots = (baseDate: Date) => {
  const start = new Date(baseDate);
  start.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: 48 }, (_, i) => {
    const d = new Date(start);
    d.setUTCMinutes(i * 30);
    return d;
  });
};

export const formatTimeOnly = (date: Date, zone: Location) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export const formatFullDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};
