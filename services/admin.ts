import { api } from './api';
import { DesignResource, User, Category, Banner } from '../types';

/**
 * Estrutura que agrupa todos os dados necessários para o AdminDashboard
 */
export interface AdminData {
  resources: DesignResource[];
  users: User[];
  categories: Category[];
  banners: Banner[];
  metrics: {
    revenue: number;
    downloads: number;
    users: number;
    subscriptionsOverTime: number[];
    churnOverTime: number[];
  };
}

/**
 * Obtém todos os dados de uma vez só para alimentar o dashboard de admin
 */
export const getAdminData = async (): Promise<AdminData> => {
  // Dispara todas as requisições em paralelo assumindo que api.get retorna diretamente os dados
  const [resources, users, categories, banners, metrics] = await Promise.all([
    api.get<DesignResource[]>('/resources'),
    api.get<User[]>('/users'),
    api.get<Category[]>('/categories'),
    api.get<Banner[]>('/banners'),
    api.get<{
      revenue: number;
      downloads: number;
      users: number;
      subscriptionsOverTime: number[];
      churnOverTime: number[];
    }>('/admin/metrics')
  ]);

  return {
    resources,
    users,
    categories,
    banners,
    metrics
  };
};