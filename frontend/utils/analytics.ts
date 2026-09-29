import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { getLocales } from 'expo-localization';
import { API_BASE_URL } from '../constants/api';
import type { Language } from '../contexts/LanguageContext';

/**
 * Anonymous usage statistics (see the privacy policy): a random installation id,
 * language, app version, platform, phone region and the screens opened.
 * Nothing is sent from development builds or the web, nor once the user opts out.
 */

const INSTALL_ID_KEY = 'analytics_install_id';
const ENABLED_KEY = 'analytics_enabled';
const PENDING_DELETE_KEY = 'analytics_pending_delete';
const FLUSH_DELAY_MS = 15 * 1000;
const MAX_QUEUE = 100;

const isSupported = !__DEV__ && (Platform.OS === 'android' || Platform.OS === 'ios');

let enabled = true;
let queue: string[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function post(path: string, body: unknown): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function getInstallId(): Promise<string> {
  let id = await AsyncStorage.getItem(INSTALL_ID_KEY);
  if (!id) {
    id = Crypto.randomUUID();
    await AsyncStorage.setItem(INSTALL_ID_KEY, id);
  }
  return id;
}

export async function loadAnalyticsEnabled(): Promise<boolean> {
  try {
    enabled = (await AsyncStorage.getItem(ENABLED_KEY)) !== 'false';
  } catch {
    enabled = true;
  }
  return enabled;
}

/** Erases on the server the data of an installation the user opted out with, until it succeeds. */
async function deleteRemoteData(): Promise<void> {
  const id = await AsyncStorage.getItem(PENDING_DELETE_KEY);
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/installs/${id}`, { method: 'DELETE' });
    if (res.ok) await AsyncStorage.removeItem(PENDING_DELETE_KEY);
  } catch {
    // Offline: retried at the next launch.
  }
}

/** Called once per app launch. Failures are silent: statistics must never disturb the user. */
export async function startSession(language: Language): Promise<void> {
  if (!isSupported) return;
  await deleteRemoteData().catch(() => {});
  if (!(await loadAnalyticsEnabled())) return;
  try {
    const region = getLocales()[0]?.regionCode ?? undefined;
    await post('/api/sessions', {
      install_id: await getInstallId(),
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version ?? '0.0.0',
      lang: language,
      ...(region && /^[A-Z]{2}$/.test(region) ? { region } : {}),
    });
  } catch {
    // Offline or server unreachable: try again at the next launch.
  }
}

async function flush(): Promise<void> {
  flushTimer = null;
  if (!queue.length || !enabled) return;
  const screens = queue.splice(0, MAX_QUEUE);
  try {
    await post('/api/events', { install_id: await getInstallId(), screens });
  } catch {
    // Dropped on purpose: screen counts are only indicative.
  }
}

export function trackScreen(screen: string): void {
  if (!isSupported || !enabled) return;
  if (queue.length < MAX_QUEUE) queue.push(screen);
  if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
}

/** Opt-in / opt-out from Settings. Opting out deletes this installation's data on the server. */
export async function setAnalyticsEnabled(value: boolean): Promise<void> {
  enabled = value;
  await AsyncStorage.setItem(ENABLED_KEY, String(value));
  if (value) return;
  queue = [];
  const id = await AsyncStorage.getItem(INSTALL_ID_KEY);
  if (!id) return;
  // A fresh id will be created if statistics are turned back on.
  await AsyncStorage.setItem(PENDING_DELETE_KEY, id);
  await AsyncStorage.removeItem(INSTALL_ID_KEY);
  if (isSupported) await deleteRemoteData();
}
