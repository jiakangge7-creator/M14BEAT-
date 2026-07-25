import { ThemeMode } from '../types';

const THEME_KEY = 'm14beat_theme_mode';

export function getStoredTheme(): ThemeMode {
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;
let mediaQueryList: MediaQueryList | null = null;

export function applyTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  const root = document.documentElement;

  // Clean up previous listener if any
  if (mediaQueryList && mediaQueryListener) {
    if (mediaQueryList.removeEventListener) {
      mediaQueryList.removeEventListener('change', mediaQueryListener);
    } else {
      mediaQueryList.removeListener(mediaQueryListener);
    }
    mediaQueryListener = null;
    mediaQueryList = null;
  }

  const isDark = () => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const updateClass = (dark: boolean) => {
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  updateClass(isDark());

  if (mode === 'system') {
    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryListener = (e: MediaQueryListEvent) => {
      updateClass(e.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', mediaQueryListener);
    } else {
      mediaQueryList.addListener(mediaQueryListener);
    }
  }
}
