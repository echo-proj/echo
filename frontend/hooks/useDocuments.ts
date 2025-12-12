import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { CreateDocumentRequest, CreateVersionRequest } from "@/pages/documents/type";

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.getAll,
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
};

export const useDocumentContent = (id: string) => {
  return useQuery({
    queryKey: ['documents', id, 'content'],
    queryFn: () => documentsApi.getContent(id),
    enabled: !!id,
    staleTime: 0,
  });
};

export const useSaveDocumentContent = () => {
  return useMutation({
    mutationFn: ({ documentId, content }: { documentId: string; content: Uint8Array }) =>
      documentsApi.saveContent(documentId, content),
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentRequest) => documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

// Version hooks
export const useDocumentVersions = (documentId: string) => {
  return useQuery({
    queryKey: ['documents', documentId, 'versions'],
    queryFn: () => documentsApi.getVersions(documentId),
    enabled: !!documentId,
  });
};

export const useCreateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: CreateVersionRequest }) =>
      documentsApi.createVersion(documentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId, 'versions'] });
    },
  });
};

export const useRestoreVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentsApi.restoreVersion(documentId, versionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId, 'content'] });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId] });
    },
  });
};

export const useDeleteVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentsApi.deleteVersion(documentId, versionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId, 'versions'] });
    },
  });
};
