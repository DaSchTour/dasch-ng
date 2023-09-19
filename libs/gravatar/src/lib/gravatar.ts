export interface GravatarResponse {
  entry: Array<GravatarEntry>;
}
export interface GravatarEntry {
  hash: string;
  requestHash: string;
  profileUrl: string;
  preferredUsername: string;
  thumbnailUrl: string;
  photos: Array<'thumbnail'>;
  displayName: string;
  urls: Array<GravatarListEntry>;
}

export interface GravatarListEntry<T = string> {
  value: string;
  type: T;
}

export type GravatarFallback =
  | '404'
  | 'mp'
  | 'identicon'
  | 'monsterid'
  | 'monster'
  | 'wavatar'
  | 'retro'
  | 'robohash'
  | 'blank';
