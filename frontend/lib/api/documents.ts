import { axiosInstance } from '../axios';
import DocumentVersion, {AddCollaboratorRequest, CreateDocumentRequest, CreateVersionRequest, Document, UserSearchResult} from "@/domain/documents/type";

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

  update: async (id: string, data: { title: string }): Promise<Document> => {
    const response = await axiosInstance.put(`/api/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/documents/${id}`);
  },

  getContent: async (documentId: string): Promise<Uint8Array> => {
    const response = await axiosInstance.get(`/api/documents/${documentId}/content`, {
      responseType: 'arraybuffer',
    });
    return new Uint8Array(response.data);
  },

  saveContent: async (documentId: string, content: Uint8Array): Promise<void> => {
    await axiosInstance.post(`/api/documents/${documentId}/content`, content, {
      headers: { 'Content-Type': 'application/octet-stream' },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  },

  searchAvailableCollaborators: async (documentId: string, query: string): Promise<UserSearchResult[]> => {
    const response = await axiosInstance.get(`/api/documents/${documentId}/available-collaborators`, {
      params: { query },
    });
    return response.data;
  },

  addCollaborator: async (documentId: string, data: AddCollaboratorRequest): Promise<void> => {
    await axiosInstance.post(`/api/documents/${documentId}/collaborators`, data);
  },

  removeCollaborator: async (documentId: string, userId: string): Promise<void> => {
    await axiosInstance.delete(`/api/documents/${documentId}/collaborators/${userId}`);
  },

  // Version management
  createVersion: async (documentId: string, data: CreateVersionRequest): Promise<DocumentVersion> => {
    const response = await axiosInstance.post(`/api/documents/${documentId}/versions`, data);
    return response.data;
  },

  getVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await axiosInstance.get(`/api/documents/${documentId}/versions`);
    return response.data;
  },

  getVersionContent: async (documentId: string, versionId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/api/documents/${documentId}/versions/${versionId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  restoreVersion: async (documentId: string, versionId: string): Promise<void> => {
    await axiosInstance.post(`/api/documents/${documentId}/versions/${versionId}/restore`);
  },

  deleteVersion: async (documentId: string, versionId: string): Promise<void> => {
    await axiosInstance.delete(`/api/documents/${documentId}/versions/${versionId}`);
  },
};
