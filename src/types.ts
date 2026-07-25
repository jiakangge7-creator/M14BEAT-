export type ThemeMode = 'light' | 'dark' | 'system';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  icon?: string; // Lucide icon name or image URL
  categoryId: string;
  tags?: string[];
  isPinned?: boolean;
  clicks?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description?: string;
  order: number;
}

export interface FileItem {
  id: string;
  title: string;
  description?: string;
  filename: string;
  filePath: string; // url to download
  fileSize: string;
  fileType: string;
  downloads: number;
  category?: string;
  tags?: string[];
  uploadedAt: string;
  isExternalUrl?: boolean;
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string; // e.g. "https://www.google.com/search?q=%s"
  icon: string;
  placeholder?: string;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  announcement?: string;
  logoIcon: string;
  footerText: string;
  defaultSearchEngineId: string;
  customBackgroundUrl?: string;
  allowPublicUpload?: boolean;
}

export interface AppDatabase {
  categories: Category[];
  links: LinkItem[];
  files: FileItem[];
  searchEngines: SearchEngine[];
  config: SiteConfig;
  adminPasswordHash: string; // simple token or plain/hashed
}

export interface UrlMetaData {
  title: string;
  description: string;
  faviconUrl: string;
}
