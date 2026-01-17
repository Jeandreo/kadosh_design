// services/userService.ts
import { api } from './api';

export const getMetrics = async (): Promise<any> => {
  return api.get('/metrics');
};