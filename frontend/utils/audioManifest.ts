export interface ManifestItem {
  url: string;
  version: string;
  size: number;
}

export type Manifest = Record<string, ManifestItem>;

/** Validates the list of recordings returned by GET /api/audio. */
export function parseManifest(data: unknown): Manifest {
  const items = (data as { items?: unknown })?.items;
  if (!items || typeof items !== 'object') return {};
  const result: Manifest = {};
  for (const [key, value] of Object.entries(items as Record<string, unknown>)) {
    const v = value as ManifestItem;
    if (
      /^[a-z0-9_-]{1,80}$/.test(key) &&
      typeof v?.url === 'string' &&
      v.url.startsWith('/api/audio/files/') &&
      typeof v.version === 'string'
    ) {
      result[key] = { url: v.url, version: v.version, size: Number(v.size) || 0 };
    }
  }
  return result;
}
