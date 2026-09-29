import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import { API_BASE_URL } from '../constants/api';
import { Manifest, ManifestItem, parseManifest } from '../utils/audioManifest';

const MANIFEST_KEY = 'audio_manifest';

interface AudioContextType {
  /** True when a recording exists for this du'a. */
  has: (key: string) => boolean;
  playingKey: string | null;
  loadingKey: string | null;
  failedKey: string | null;
  toggle: (key: string) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const audioDir = () => new Directory(Paths.document, 'audio');

/** Local copy of a recording, downloaded once per version (native only). */
async function localUri(key: string, item: ManifestItem): Promise<string> {
  const remote = `${API_BASE_URL}${item.url}`;
  if (Platform.OS === 'web') return remote;
  const dir = audioDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const name = item.url.split('/').pop()!;
  const file = new File(dir, name);
  if (!file.exists) {
    await File.downloadFileAsync(remote, file);
    // Remove older versions of the same recording.
    for (const entry of dir.list()) {
      if (entry instanceof File && entry.name.startsWith(`${key}-`) && entry.name !== name) entry.delete();
    }
  }
  return file.uri;
}

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [manifest, setManifest] = useState<Manifest>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(MANIFEST_KEY)
      .then((raw) => {
        if (!cancelled && raw) setManifest((m) => (Object.keys(m).length ? m : parseManifest(JSON.parse(raw))));
      })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/audio`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        const fresh = parseManifest(data);
        if (!cancelled) setManifest(fresh);
        return AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify({ items: fresh }));
      })
      .catch(() => {
        // Offline: the cached manifest and downloaded files still work.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Du'as should be audible even when the phone is on silent.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    const player = createAudioPlayer(null);
    playerRef.current = player;
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) setPlayingKey(null);
    });
    return () => {
      sub.remove();
      player.remove();
      playerRef.current = null;
    };
  }, []);

  const toggle = useCallback(
    async (key: string) => {
      const player = playerRef.current;
      const item = manifest[key];
      if (!player || !item) return;
      if (playingKey === key) {
        player.pause();
        setPlayingKey(null);
        return;
      }
      player.pause();
      setPlayingKey(null);
      setFailedKey(null);
      setLoadingKey(key);
      try {
        const uri = await localUri(key, item);
        player.replace({ uri });
        await player.seekTo(0);
        player.play();
        setPlayingKey(key);
      } catch (error) {
        console.error('Cannot play recording:', error);
        setFailedKey(key);
      } finally {
        setLoadingKey(null);
      }
    },
    [manifest, playingKey]
  );

  const has = useCallback((key: string) => key in manifest, [manifest]);

  const value = useMemo(
    () => ({ has, playingKey, loadingKey, failedKey, toggle }),
    [has, playingKey, loadingKey, failedKey, toggle]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useDuaAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useDuaAudio must be used within AudioProvider');
  }
  return context;
};
