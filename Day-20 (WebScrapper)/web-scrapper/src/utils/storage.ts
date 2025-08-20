/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScrapeHistory } from '../types';

const STORAGE_KEY = 'scrape_history';
const MAX_HISTORY_ITEMS = 50;

export function getScrapeHistory(): ScrapeHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading scrape history:', error);
    return [];
  }
}

export function addToScrapeHistory(item: Omit<ScrapeHistory, 'id'>): void {
  try {
    const history = getScrapeHistory();
    const newItem: ScrapeHistory = {
      ...item,
      id: Date.now().toString(),
    };
    
    // Remove duplicates and add to beginning
    const filtered = history.filter(h => h.url !== item.url);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving scrape history:', error);
  }
}

export function clearScrapeHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing scrape history:', error);
  }
}

export function exportScrapeData(data: any, filename: string): void {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}
