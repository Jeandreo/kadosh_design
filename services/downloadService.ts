const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const registerDownloadRequest = async (
  resourceId: string,
  token: string
): Promise<{ success: boolean; quotaUsed: number }> => {
  const res = await fetch(`${API_URL}/downloads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ resourceId })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Erro ao registrar download');
  }

  return data;
};

export interface UserDownloadDTO {
  resourceId: string;
  downloadedAt: string;
}

export const getMyDownloadsRequest = async (
  token: string
): Promise<UserDownloadDTO[]> => {
  const res = await fetch(`${API_URL}/downloads/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao buscar histórico de downloads');
  }

  return res.json();
};
