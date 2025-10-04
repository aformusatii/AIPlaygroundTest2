import type { AxiosRequestConfig } from 'axios';
import { http } from './httpClient';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  workspaceId?: string;
  tags?: string[];
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ItemResponse<T> {
  success: boolean;
  data: T;
}

export const listResource = async <T>(resource: string, params: ListParams = {}) => {
  const response = await http.get<ListResponse<T>>(resource, { params });
  return response.data;
};

export const getResource = async <T>(resource: string, id: string) => {
  const response = await http.get<ItemResponse<T>>(`${resource}/${id}`);
  return response.data;
};

export const createResource = async <TCreate, TResponse>(resource: string, payload: TCreate) => {
  const response = await http.post<ItemResponse<TResponse>>(resource, payload);
  return response.data;
};

export const updateResource = async <TUpdate, TResponse>(resource: string, id: string, payload: TUpdate) => {
  const response = await http.put<ItemResponse<TResponse>>(`${resource}/${id}`, payload);
  return response.data;
};

export const deleteResource = async (resource: string, id: string, config?: AxiosRequestConfig) => {
  await http.delete(`${resource}/${id}`, config);
};

export const uploadIcon = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await http.post<{ success: boolean; data: { url: string } }>('uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.url;
};

export const copySecretField = async (resource: string, id: string, path: string) => {
  const response = await http.post<{ success: boolean; value: string }>(`${resource}/${id}/secret/${path}/copy`);
  return response.data.value;
};
