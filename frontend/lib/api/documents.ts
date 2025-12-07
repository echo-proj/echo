import { axiosInstance } from '../axios';
import {CreateDocumentRequest, Document} from "@/pages/documents/type";

export const documentsApi = {
  getAll: async (): Promise<Document[]> => {
    const response = await axiosInstance.get('/api/documents');
    return response.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await axiosInstance.get(`/api/documents/${id}`);
    return response.data;
  },

  create: async (data: CreateDocumentRequest): Promise<Document> => {
    const response = await axiosInstance.post('/api/documents', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/documents/${id}`);
  },
};
