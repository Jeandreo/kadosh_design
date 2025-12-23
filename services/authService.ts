import { User } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

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

export const updateProfileRequest = async (
  name: string,
  email: string,
  token: string
): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao atualizar perfil');
  }

  const data = await res.json();
  return data.user;
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
