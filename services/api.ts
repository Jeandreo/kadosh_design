
import { CONFIG } from '../config';

// Definição de erros padronizados da API
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Cabeçalhos padrão para todas as requisições
const getHeaders = () => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // Nota: Recupera token do LocalStorage se existir
  const token = localStorage.getItem('kadosh_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};


// Wrapper genérico para fetch com tipagem e tratamento de erro
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${CONFIG.URL_BACKEND}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  // Se não for FormData, garante Content-Type JSON
  if (!(options.body instanceof FormData) && !config.headers?.['Content-Type' as keyof HeadersInit]) {
      (config.headers as any)['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new ApiError('Sessão expirada. Faça login novamente.', 401);
        }
        
        let errorMessage = 'Erro na comunicação com o servidor.';
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorMessage;
        } catch {
            errorMessage = response.statusText;
        }
        
        throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
        throw error;
    }
    // Erros de rede (offline, DNS, servidor caiu)
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 0);
  }
}

// Métodos HTTP exportados
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { 
    method: 'PUT', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  patch: <T>(endpoint: string, body: any) => request<T>(endpoint, { 
    method: 'PATCH', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  // Método específico para upload com monitoramento de progresso ou FormData
  upload: <T>(endpoint: string, formData: FormData) => request<T>(endpoint, {
      method: 'POST',
      body: formData
  })
};
