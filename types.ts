export enum ResourceType {
  DESTAQUES = 'Destaques',
  FLYERS = 'Flyers',
  POSTS = 'Posts',
  BANNERS = 'Banners',
  CONVITES = 'Convites',
  CULTOS = 'Cultos',
  DATAS = 'Datas Comemorativas',
  ASSETS = 'Assets'
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  category: string; // Target category for filtering
  order: number;
}

// Added 'VETOR' to support asset resources like fonts/vectors, replacing ZIP
export type ResourceFormat = 'PSD' | 'PNG' | 'JPG' | 'CANVA' | 'VETOR';
export type ResourceOrientation = 'Portrait' | 'Landscape' | 'Square';

export interface DesignResource {
  id: string;
  title: string;
  categories: string[]; // Changed from single type to array of categories
  searchTerms?: string; // Hidden keywords for search
  imageUrl: string;
  downloads: number;
  author: string;
  premium: boolean;
  tags: string[];
  format: ResourceFormat;
  orientation: ResourceOrientation;
  canvaAvailable?: boolean;
  canvaUrl?: string;
  downloadUrl?: string;
  watermarkImageUrl?: string;
  createdAt?: string; // ISO Date String for sorting
  
  // New Metadata Fields
  resolution?: string; // e.g. "300 DPI"
  dimensions?: string; // e.g. "1080x1350px"
  fileSize?: string;   // e.g. "25 MB"
}

export interface SearchState {
  query: string;
  type: string;
  aiEnhanced: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  date: string;
  link?: string;
}

// User & Auth Types
export type UserRole = 'admin' | 'member';
export type UserPlan = 'free' | 'volunteer' | 'ministry' | 'premium_annual';

export interface DownloadHistoryItem {
  resourceId: string;
  timestamp: number; // UTC timestamp
  dateString: string; // "YYYY-MM-DD" in Brasilia Time to track daily unique downloads
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  quotaUsed: number;
  quotaTotal: number;
  renewalDate: string; // Visual string
  subscriptionExpiry: number | null; // Timestamp of expiration
  lastQuotaReset: string; // "YYYY-MM-DD" in Brasilia Time
  favorites: string[];
  downloadsHistory: DownloadHistoryItem[]; // Detailed history
  autoRenew?: boolean;
}


export interface Plan {
  id: 'volunteer' | 'ministry' | 'premium_annual';
  name: string;
  price: number;
  billing: 'monthly' | 'annual';
}

export interface CreatePreferencePayload {
  planId: string;
  title: string;
  price: number;
  userId: string;
  billing: 'monthly' | 'annual';
}

export interface SubscriptionCheckout {
  id: string;
  init_point: string;
}
