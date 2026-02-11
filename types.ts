
export interface DesignState {
  headline: string;
  category: string;
  source: string;
  imageUrl: string | null;
  logoUrl: string | null;
  themeColor: string;
  layout: 'overlay' | 'split' | 'minimal';
  overlayOpacity: number;
  fontSize: number;
  imageBrightness: number;
  imageContrast: number;
  customCss: string;
}

export interface SuggestionResponse {
  headlines: string[];
}

export enum ThemeColors {
  ECONOMIC_BLUE = '#0f172a',
  PROFIT_GREEN = '#059669',
  GOLD_ACCENT = '#d97706',
  MODERN_BLACK = '#18181b',
  CRITICAL_RED = '#dc2626',
  ROYAL_PURPLE = '#581c87',
  OCEAN_TEAL = '#0e7490',
  SLATE_GREY = '#334155'
}