import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
import type { Language } from '../contexts/LanguageContext';

export interface AppMessage {
  id: string;
  kind: 'info' | 'tip' | 'warning';
  title: string;
  body: string;
  updated_at?: string;
}

const CACHE_KEY = (lang: Language) => `app_messages_${lang}`;
const DISMISSED_KEY = 'app_messages_dismissed';
const TIMEOUT_MS = 8000;

export function sanitizeMessages(data: unknown): AppMessage[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (m): m is AppMessage =>
        typeof m?.id === 'string' &&
        typeof m?.title === 'string' &&
        m.title.trim() !== '' &&
        ['info', 'tip', 'warning'].includes(m?.kind)
    )
    .map((m) => ({ id: m.id, kind: m.kind, title: m.title, body: typeof m.body === 'string' ? m.body : '', updated_at: m.updated_at }))
    .slice(0, 5);
}

/** Last messages received, shown immediately (and when offline). */
export async function loadCachedMessages(lang: Language): Promise<AppMessage[]> {
  try {
    return sanitizeMessages(JSON.parse((await AsyncStorage.getItem(CACHE_KEY(lang))) ?? '[]'));
  } catch {
    return [];
  }
}

export async function fetchMessages(lang: Language): Promise<AppMessage[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/api/messages?lang=${lang}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const messages = sanitizeMessages(await res.json());
    await AsyncStorage.setItem(CACHE_KEY(lang), JSON.stringify(messages));
    return messages;
  } finally {
    clearTimeout(timer);
  }
}

/** A dismissed message comes back if the admin edits it (id + update date). */
export const dismissKey = (m: AppMessage) => `${m.id}@${m.updated_at ?? ''}`;

export async function loadDismissed(): Promise<string[]> {
  try {
    const list = JSON.parse((await AsyncStorage.getItem(DISMISSED_KEY)) ?? '[]');
    return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveDismissed(keys: string[]): Promise<void> {
  // Keep the list short: only the most recent dismissals matter.
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(keys.slice(-50)));
}
