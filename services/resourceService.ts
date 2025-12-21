// services/resourceService.ts
import { api } from './api';
import { DesignResource } from '../types';

export const getResources = async (): Promise<DesignResource[]> => {
  return api.get('/resources');
};

export const addResource = async (resource: DesignResource) => {
  const payload = {
    title: resource.title,
    imageUrl: resource.imageUrl,
    watermarkImageUrl: resource.watermarkImageUrl,
    downloadUrl: resource.downloadUrl,
    category: resource.categories[0],
    tags: resource.tags,
    searchTerms: resource.searchTerms,
    premium: resource.premium,
    format: resource.format,
    orientation: resource.orientation,
    canvaAvailable: resource.canvaAvailable,
    canvaUrl: resource.canvaUrl,
    resolution: resource.resolution,
    dimensions: resource.dimensions,
    fileSize: resource.fileSize,
    author: resource.author,
  };

  return api.post('/resources', payload);
};

export const updateResource = async (resource: DesignResource) => {
  return api.put(`/resources/${resource.id}`, resource);
};

export const deleteResource = async (id: string) => {
  return api.delete(`/resources/${id}`);
};
