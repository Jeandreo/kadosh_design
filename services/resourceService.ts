
import { DesignResource, Category, Banner, User, UserPlan } from '../types';
import { api } from './api';

// Simulation helpers
const SIMULATED_DELAY = 600; // ms

// LocalStorage helpers to persist mock changes during session
const getStored = <T>(key: string, defaultVal: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
};

const setStored = (key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export const getResources = async (): Promise<DesignResource[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = getStored('mock_resources', []);
            resolve(data);
        }, SIMULATED_DELAY);
    });
};

export const fetchResourcesFromFirebase = getResources;

export const addResource = async (resource: DesignResource) => {
  const payload = {
    title: resource.title,
    imageUrl: resource.imageUrl,
    watermarkImageUrl: resource.watermarkImageUrl,
    downloadUrl: resource.downloadUrl,
    category: resource.categories[0], // backend aceita 1
    tags: resource.tags,
    searchTerms: resource.searchTerms,
    premium: resource.premium,
    format: resource.format,
    orientation: resource.orientation,
    canvaAvailable: resource.canvaAvailable,
    canvaUrl: resource.canvaUrl,
    resolution: resource.resolution,
    dimensions: resource.dimensions,
    fileSize: resource.fileSize,
    author: resource.author
  };

  return api.post('/resources', payload);
};


export const updateResource = async (updatedResource: DesignResource): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const current = getStored<DesignResource[]>('mock_resources', []);
            const updated = current.map(r => r.id === updatedResource.id ? updatedResource : r);
            setStored('mock_resources', updated);
            resolve();
        }, SIMULATED_DELAY);
    });
};

export const deleteResource = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const current = getStored<DesignResource[]>('mock_resources', []);
            const updated = current.filter(r => r.id !== id);
            setStored('mock_resources', updated);
            resolve();
        }, SIMULATED_DELAY);
    });
};

// --- CATEGORIES ---

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export const saveCategory = async (cat: Category) => {
    const current = getStored<Category[]>('mock_categories', []);
    if (!current.find(c => c.id === cat.id)) {
        setStored('mock_categories', [...current, cat]);
    }
    return Promise.resolve();
};

export const refreshCategories = (cats: Category[]) => {
    setStored('mock_categories', cats);
}

// --- BANNERS ---

export const getBanners = async (): Promise<Banner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = getStored('mock_banners', []);
            resolve(data);
        }, SIMULATED_DELAY);
    });
};

export const saveBanners = async (banners: Banner[]) => {
    setStored('mock_banners', banners);
    return Promise.resolve();
};

// --- USERS MANAGEMENT (MOCK) ---

export const getUsers = async (): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = getStored('mock_users', []);
            resolve(data);
        }, SIMULATED_DELAY);
    });
};

export const updateUserPlan = async (userId: string, newPlan: UserPlan): Promise<void> => {
    const current = getStored<User[]>('mock_users', []);
    const updated = current.map(u => {
        if (u.id === userId) {
            let quotaTotal = 1;
            if (newPlan === 'volunteer') quotaTotal = 3;
            if (newPlan === 'ministry') quotaTotal = 7;
            if (newPlan === 'premium_annual') quotaTotal = 7;
            
            return { ...u, plan: newPlan, quotaTotal };
        }
        return u;
    });
    setStored('mock_users', updated);
    return Promise.resolve();
};