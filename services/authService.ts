import { User } from '../types';

const API_URL = 'http://localhost:3001/api';

export const loginRequest = async (
  email: string,
  password: string
): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro no login');
  }

  return res.json();
};

export const signupRequest = async (
  name: string,
  email: string,
  password: string
): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro no cadastro');
  }

  return res.json();
};
