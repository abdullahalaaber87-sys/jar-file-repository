export interface JarFile {
  id: string;
  fileName: string; // Any filename and extension
  title: string;
  description: string;
  version: string;
  fileSizeBytes: number;
  uploadDate: string; // ISO date format
  downloadCount: number;
  iconUrl?: string; // Optional custom image or data URL
  iconCategory?:
    | 'server'
    | 'plugin'
    | 'tool'
    | 'library'
    | 'utility'
    | 'network'
    | 'archive'
    | 'executable'
    | 'document'
    | 'media'
    | 'code'
    | 'other';
  changelog?: string; // Optional changelog notes
  fileExtension?: string; // Detected extension (e.g. jar, zip, exe, pdf, apk)
  javaVersion?: string; // Optional (e.g. 'Java 17+', 'Java 21+')
  mainClass?: string; // Optional
  sha256Checksum?: string;
  isCustomUpload?: boolean;
}

export type SortOption = 'newest' | 'oldest' | 'downloads' | 'size-desc' | 'size-asc' | 'title-asc';
export type ViewMode = 'grid' | 'list';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
