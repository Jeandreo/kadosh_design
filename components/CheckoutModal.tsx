import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from './Toast';
import { CONFIG } from '../config';
import { paymentService } from '../services/paymentService';
import { Plan } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  plan: Plan | null;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, plan, onClose, onNavigate }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('pix');
      setIsProcessing(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMercadoPagoCheckout = async () => {
    if (!user || !plan) return;

    setIsProcessing(true);

    try {
      const preference = await paymentService.createPreference({
        planId: plan.id,
        title: plan.name,
        price: plan.price,
        userId: user.id,
        billing: plan.billing
      });

      window.location.href = preference.init_point;
    } catch (err) {
      setErrorMsg('Erro ao iniciar pagamento');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s_ease-out]"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-surface rounded-xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-lock text-blue-500"></i> Checkout Mercado Pago
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar text-center">
            
            <div className="mb-8">
                 {/* <img 
                    src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.22/mercadopago/logo__large.png" 
                    alt="Mercado Pago" 
                    className="h-8 mx-auto mb-4 opacity-90"
                 /> */}
                 <h3 className="text-white font-bold text-lg mb-2">{plan.name}</h3>
                 <p className="text-text-muted text-sm">Acesso total por 30 dias.</p>
                 <div className="text-3xl font-extrabold text-white mt-4">
                 {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(plan.price)}
                 </div>
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-red-400 text-xs mb-4">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-4">
                <button 
                    onClick={handleMercadoPagoCheckout}
                    disabled={isProcessing}
                    className="w-full bg-[#009EE3] hover:bg-[#008ED6] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Processando...
                        </>
                    ) : (
                        <>
                            Pagar com Mercado Pago
                            <i className="fas fa-external-link-alt text-xs opacity-70"></i>
                        </>
                    )}
                </button>
                
                <p className="text-[10px] text-text-muted mt-4 max-w-xs mx-auto">
                    Você será redirecionado para o ambiente seguro do Mercado Pago. Aceitamos Pix, Cartão de Crédito e Boleto.
                </p>
            </div>
        </div>

        <div className="p-4 bg-background border-t border-border text-center">
          <p className="text-[10px] text-text-muted">
            <i className="fas fa-shield-alt text-green-500 mr-1"></i> Ambiente Seguro SSL.
          </p>
        </div>
      </div>
    </div>
  );
};
