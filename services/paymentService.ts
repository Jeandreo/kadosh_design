// services/paymentService.ts
import { api } from './api';
import { SubscriptionCheckout } from '../types';

export const paymentService = {
  createSubscription: async (
    payload: any
  ): Promise<SubscriptionCheckout> => {
    const response = await api.post<SubscriptionCheckout>(
      '/subscriptions',
      payload
    );
    return response;
  },
};
