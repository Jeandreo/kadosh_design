// services/userService.ts
import { api } from './api';
import { User, UserPlan } from '../types';

export const getUsers = async (): Promise<User[]> => {
  return api.get('/users');
};

export const updateUserPlan = async (userId: string, plan: UserPlan) => {
  return api.put(`/users/${userId}/plan`, { plan });
};
