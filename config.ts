
// ⚠️ CONFIGURAÇÃO DO AMBIENTE KADOSH DESIGN ⚠️

// Helper seguro para evitar erros em ambientes onde process não existe
const getEnv = (key: string, defaultValue: string): string => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key] as string;
        }
        if (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env[key]) {
            return (import.meta as any).env[key] as string;
        }
    } catch (e) {
        // Ignora erro
    }
    return defaultValue;
};

// Detecta se está rodando localmente, no domínio oficial ou no VPS Hostinger
const getApiBaseUrl = () => {
    // Se estiver no navegador
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // Se for localhost, usa o proxy do Vite (/api)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return '/api';
        }
        
        // Se for o domínio técnico da Hostinger (VPS)
        if (hostname === 'srv1186883.hstgr.cloud') {
             // Se estiver acessando direto pelo VPS, assume que a API está rodando na mesma origem/porta proxied
             // ou retorna a URL relativa
             return '/api';
        }

        // Se estiver acessando pelo domínio principal, tenta o subdomínio api
        if (hostname.includes('kadoshdesign.com.br')) {
            return 'https://api.kadoshdesign.com.br/api';
        }
        
        // Fallback para subdomínio api
        return 'https://api.kadoshdesign.com.br/api';
    }
    // Fallback padrão
    return 'https://api.kadoshdesign.com.br/api';
};

export const CONFIG = {
  APP_NAME: 'Kadosh Design',
  SUPPORT_EMAIL: 'kadosh.suporteonline@gmail.com',
  WHATSAPP_NUMBER: '5531986022600',

  // API URL Automática (Local vs Produção)
  API_BASE_URL: getApiBaseUrl(),
  
  // 💳 MERCADO PAGO (Produção)
  MP_PUBLIC_KEY: 'APP_USR-9ab1dbd5-66d7-4582-aceb-23b285303885', 
  PIX_KEY_DISPLAY: '53.283.247/0001-29',

  URL_BACKEND: 'http://localhost:3001/api',

  // 🔥 FIREBASE (Opcional - Apenas Storage se necessário)
  FIREBASE: {
    API_KEY: getEnv('REACT_APP_FIREBASE_API_KEY', ''),
    AUTH_DOMAIN: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN', ''),
    PROJECT_ID: getEnv('REACT_APP_FIREBASE_PROJECT_ID', ''),
    STORAGE_BUCKET: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET', ''),
    MESSAGING_SENDER_ID: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', ''),
    APP_ID: getEnv('REACT_APP_FIREBASE_APP_ID', '')
  }
};
