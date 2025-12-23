import { initMercadoPago } from '@mercadopago/sdk-react';
import { CONFIG } from '../config';
import { api } from './api';

// Inicializa o SDK do Mercado Pago com a Public Key
if (CONFIG.MP_PUBLIC_KEY && CONFIG.MP_PUBLIC_KEY !== 'TEST-00000000-0000-0000-0000-000000000000') {
    initMercadoPago(CONFIG.MP_PUBLIC_KEY, { locale: 'pt-BR' });
}

export interface PaymentPreference {
    id: string; // ID da preferência gerado pelo Backend
    init_point: string; // URL de checkout
}

export interface CreatePreferencePayload {
    planId: string;
    title: string;
    price: number;
    userId: string;
    billing: 'monthly' | 'annual';
  }

export const paymentService = {
    createPreference: async (
      payload: CreatePreferencePayload
    ): Promise<PaymentPreference> => {
      try {
        const response = await api.post<PaymentPreference>(
          '/payments/create-preference',
          payload
        );
        return response;
      } catch (error) {
        console.error('Erro ao criar preferência de pagamento:', error);
        throw error;
      }
    },
  
    checkStatus: async (paymentId: string) => {
      return api.get(`/payments/status/${paymentId}`);
    }
  };

  