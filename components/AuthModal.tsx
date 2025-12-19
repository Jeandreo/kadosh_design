
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose, onSuccess }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setName('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        let success = false;
        if (mode === 'login') {
            success = await login(email, password);
        } else {
            success = await signup(name, email, password);
        }

        if (success) {
            onSuccess();
        }
    } catch (err) {
        console.error("Auth error", err);
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-surface rounded-xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] border border-border">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-text-muted text-sm">
              {mode === 'login' 
                ? 'Acesse sua biblioteca de artes cristãs.' 
                : 'Junte-se à maior comunidade de design cristão.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="far fa-user text-text-muted"></i>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-background border border-border text-text-main rounded-lg py-3 pl-10 pr-4 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all placeholder-text-muted/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="far fa-envelope text-text-muted"></i>
                </div>
                <input 
                  id="loginEmail"
                  type="email" 
                  placeholder="seu@email.com"
                  className="w-full bg-background border border-border text-text-main rounded-lg py-3 pl-10 pr-4 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all placeholder-text-muted/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-text-muted"></i>
                </div>
                <input 
                  type="password" 
                  placeholder="******"
                  className="w-full bg-background border border-border text-text-main rounded-lg py-3 pl-10 pr-4 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all placeholder-text-muted/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <a href="#" className="text-xs text-secondary hover:text-white transition-colors">Esqueceu a senha?</a>
              </div>
            )}

            <button 
              id="btnLoginSubmit"
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] mt-6 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processando...
                  </>
              ) : (
                  mode === 'login' ? 'Entrar' : 'Cadastrar'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-text-muted text-sm">
              {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
              <button 
                onClick={toggleMode}
                className="text-secondary font-bold hover:text-white transition-colors underline decoration-secondary/30 underline-offset-4"
              >
                {mode === 'login' ? 'Cadastre-se aqui' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
