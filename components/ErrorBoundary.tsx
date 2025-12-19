
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#181A1B] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#202324] border border-white/5 rounded-2xl p-8 text-center shadow-2xl animate-[fadeIn_0.3s_ease-out]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Algo deu errado</h1>
            <p className="text-[#9AA0A6] text-sm mb-8 leading-relaxed">
              Não foi possível carregar o conteúdo. Isso pode acontecer devido a uma falha na conexão ou um erro temporário no sistema.
            </p>

            <div className="space-y-3">
                <button 
                    onClick={this.handleReload}
                    className="w-full bg-[#576063] hover:bg-[#BFC5C7] hover:text-[#181A1B] text-white font-bold py-3 px-6 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <i className="fas fa-sync-alt"></i> Tentar Novamente
                </button>
                <button 
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-transparent border border-white/10 text-[#9AA0A6] hover:text-white hover:bg-white/5 font-medium py-3 px-6 rounded-lg transition-all"
                >
                    Voltar ao Início
                </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
