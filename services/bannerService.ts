// services/bannerService.ts
import { api } from './api';
import { Banner } from '../types';

export const getBanners = async (): Promise<Banner[]> => {
  return api.get('/banners');
};

export const saveBanners = async (banners: Banner[]) => {
  return api.post('/banners', banners);
};
