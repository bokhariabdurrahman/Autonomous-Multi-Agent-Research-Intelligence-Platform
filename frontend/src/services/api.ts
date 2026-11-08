import axios from 'axios';
import type {
  AgentLog,
  AgentState,
  DocumentItem,
  OverviewStats,
  Report,
  ResearchProject,
  UsageStats,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('nexus_token', res.data.access_token);
    return res.data;
  },
  register: async (email: string, password: string, fullName?: string) => {
    const res = await apiClient.post<User>('/auth/register', { email, password, full_name: fullName });
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('nexus_token');
  },
  getMe: async () => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

// Research
export const researchApi = {
  create: async (data: {
    research_question: string;
    mode: string;
    depth: string;
    max_sources: number;
    include_academic: boolean;
    selected_document_ids?: string[];
  }) => {
    const res = await apiClient.post<ResearchProject>('/research', data);
    return res.data;
  },
  list: async (skip = 0, limit = 20) => {
    const res = await apiClient.get<ResearchProject[]>('/research', { params: { skip, limit } });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<ResearchProject>(`/research/${id}`);
    return res.data;
  },
  approvePlan: async (
    id: string,
    data: {
      approved: boolean;
      feedback?: string;
      edited_subtasks?: any[];
      edited_search_queries?: string[];
    }
  ) => {
    const res = await apiClient.post<ResearchProject>(`/research/${id}/approve`, data);
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.post(`/research/${id}/cancel`);
    return res.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/research/${id}`);
  },
};

// Agents Telemetry
export const agentsApi = {
  getStates: async (projectId: string) => {
    const res = await apiClient.get<AgentState[]>(`/research/${projectId}/agents`);
    return res.data;
  },
  getLogs: async (projectId: string) => {
    const res = await apiClient.get<AgentLog[]>(`/research/${projectId}/logs`);
    return res.data;
  },
};

// Documents & RAG
export const documentsApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<DocumentItem>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  list: async () => {
    const res = await apiClient.get<DocumentItem[]>('/documents');
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<DocumentItem>(`/documents/${id}`);
    return res.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/documents/${id}`);
  },
  queryRag: async (query: string, documentIds?: string[], topK = 5) => {
    const res = await apiClient.post('/rag/query', {
      query,
      document_ids: documentIds,
      top_k: topK,
    });
    return res.data;
  },
};

// Reports
export const reportsApi = {
  list: async (skip = 0, limit = 20) => {
    const res = await apiClient.get<Report[]>('/reports', { params: { skip, limit } });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<Report>(`/reports/${id}`);
    return res.data;
  },
  getPdfDownloadUrl: (reportId: string) => {
    return `${API_BASE_URL}/reports/${reportId}/download`;
  },
};

// Analytics
export const analyticsApi = {
  getOverview: async () => {
    const res = await apiClient.get<OverviewStats>('/analytics/overview');
    return res.data;
  },
  getUsage: async () => {
    const res = await apiClient.get<UsageStats>('/analytics/usage');
    return res.data;
  },
};
