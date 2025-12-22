
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPlan, Notification, Category, Banner } from '../types';
import { signupRequest, updateProfileRequest } from '../services/authService';
import { getBanners } from '../services/bannerService';
import { getCategories } from '../services/categoriesService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
  unreadCount: number;
  categories: Category[]; 
  banners: Banner[]; 
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  upgradeSubscription: (newPlan: UserPlan) => void;
  registerDownload: (resourceId: string) => Promise<{ success: boolean; message: string }>;
  cancelSubscription: () => Promise<void>;
  toggleFavorite: (resourceId: string) => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => void;
  refreshCategories: () => Promise<void>;
  refreshBanners: (newBanners: Banner[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load Data
  useEffect(() => {
      const loadStaticData = async () => {
          try {
              const cats = await getCategories();
              setCategories(cats);
              const bans = await getBanners();
              setBanners(bans);
          } catch (e) {
              console.error("Failed to load static data", e);
          }
      };
      loadStaticData();
  }, []);

  const API_URL = 'http://localhost:3001';
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    localStorage.setItem('auth_token', data.token);
    setUser(data.user);

    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { token, user } = await signupRequest(name, email, password);

      localStorage.setItem('auth_token', token);
      setUser(user);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const loginWithGoogle = async (): Promise<boolean> => {
      alert("Login com Google indisponível na simulação.");
      return false;
  }

  const upgradeSubscription = async (newPlan: UserPlan) => {
    if (!user) return;
    const updatedUser = { ...user, plan: newPlan };
    setUser(updatedUser);
    localStorage.setItem('kadosh_mock_user', JSON.stringify(updatedUser));
  };

  const cancelSubscription = async () => {
      if (!user) return;
      const updatedUser = { ...user, autoRenew: false };
      setUser(updatedUser);
      localStorage.setItem('kadosh_mock_user', JSON.stringify(updatedUser));
  };

  const registerDownload = async (resourceId: string): Promise<{ success: boolean; message: string }> => {
      if (!user) return { success: false, message: "Faça login." };
      
      // Mock Quota Logic
      if (user.quotaUsed >= user.quotaTotal) {
           return { success: false, message: "Limite diário de downloads atingido!" };
      }
      
      const updatedUser = { 
          ...user, 
          quotaUsed: user.quotaUsed + 1,
          downloadsHistory: [{
              resourceId,
              timestamp: Date.now(),
              dateString: new Date().toLocaleDateString()
          }, ...(user.downloadsHistory || [])]
      };
      
      setUser(updatedUser);
      localStorage.setItem('kadosh_mock_user', JSON.stringify(updatedUser));
      
      return { success: true, message: "Download autorizado (Simulação)." };
  };

  const toggleFavorite = async (resourceId: string) => {
    if (!user) return;
    const isFav = user.favorites.includes(resourceId);
    const newFavs = isFav ? user.favorites.filter(id => id !== resourceId) : [...user.favorites, resourceId];
    
    const updatedUser = { ...user, favorites: newFavs };
    setUser(updatedUser);
    localStorage.setItem('kadosh_mock_user', JSON.stringify(updatedUser));
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) return;
  
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Usuário não autenticado');
  
    const updatedUser = await updateProfileRequest(name, email, token);
  
    setUser(updatedUser);
  };
  

  const markAllNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'date'>) => setNotifications(p => [{ ...n, id: Date.now().toString(), read: false, date: 'Agora' }, ...p]);
  
  const refreshCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (e) {
      console.error('Erro ao atualizar categorias', e);
    }
  };

  const refreshBanners = (bans: Banner[]) => {
      setBanners(bans);
      // saveBanners(bans);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isLoading, 
        notifications, 
        unreadCount,
        categories,
        banners,
        login, 
        signup,
        loginWithGoogle,
        logout, 
        upgradeSubscription,
        cancelSubscription,
        registerDownload, 
        toggleFavorite, 
        updateProfile,
        markAllNotificationsAsRead,
        addNotification,
        refreshCategories,
        refreshBanners
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
