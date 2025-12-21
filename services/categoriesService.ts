import { api } from './api';
import { Category } from '../types';


export const getCategories = async (): Promise<Category[]> => {
    return api.get('/categories');
};

export const fetchCategories = () =>
  api.get<Category[]>('/categories');

export const createCategory = (name: string) =>
  api.post<Category>('/categories', { name });

export const updateCategory = (id: string, name: string) =>
  api.put(`/categories/${id}`, { name });

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`);
