import axios from 'axios';
import { TodoItem, Tag, ApiResponse, TodoQueryParams } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// Todo相关API
export const todoApi = {
  // 获取所有待办事项
  getAll: (params?: TodoQueryParams): Promise<ApiResponse<TodoItem[]>> => {
    return api.get('/todos', { params });
  },

  // 根据ID获取待办事项
  getById: (id: number): Promise<ApiResponse<TodoItem>> => {
    return api.get(`/todos/${id}`);
  },

  // 创建待办事项
  create: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TodoItem>> => {
    return api.post('/todos', todo);
  },

  // 更新待办事项
  update: (id: number, todo: Partial<TodoItem>): Promise<ApiResponse<TodoItem>> => {
    return api.put(`/todos/${id}`, todo);
  },

  // 删除待办事项
  delete: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/todos/${id}`);
  },

  // 更新状态
  updateStatus: (id: number, status: number): Promise<ApiResponse<TodoItem>> => {
    return api.patch(`/todos/${id}/status`, { status });
  },
};

// 标签相关API
export const tagApi = {
  // 获取所有标签
  getAll: (): Promise<ApiResponse<Tag[]>> => {
    return api.get('/tags');
  },

  // 根据ID获取标签
  getById: (id: number): Promise<ApiResponse<Tag>> => {
    return api.get(`/tags/${id}`);
  },

  // 创建标签
  create: (tag: Omit<Tag, 'id' | 'createdAt'>): Promise<ApiResponse<Tag>> => {
    return api.post('/tags', tag);
  },

  // 更新标签
  update: (id: number, tag: Partial<Tag>): Promise<ApiResponse<Tag>> => {
    return api.put(`/tags/${id}`, tag);
  },

  // 删除标签
  delete: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/tags/${id}`);
  },
};

// 文件上传相关API
export const fileApi = {
  // 上传单个文件
  uploadSingle: (file: File): Promise<ApiResponse<{ fileName: string; fileUrl: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 上传多个文件
  uploadMultiple: (files: File[]): Promise<ApiResponse<{ fileNames: string[]; fileUrls: string[] }>> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return api.post('/files/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 删除文件
  delete: (fileName: string): Promise<ApiResponse<void>> => {
    return api.delete(`/files/${fileName}`);
  },

  // 获取文件URL
  getFileUrl: (fileName: string): string => {
    return `${API_BASE_URL}/files/${fileName}`;
  },
};

export default api;
