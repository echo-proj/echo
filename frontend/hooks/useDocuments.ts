import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { CreateDocumentRequest, CreateVersionRequest } from "@/domain/documents/type";

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

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string } }) =>
      documentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.id] });
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

export const useSearchAvailableCollaborators = (documentId: string, query: string) => {
  return useQuery({
    queryKey: ['documents', documentId, 'available-collaborators', query],
    queryFn: () => documentsApi.searchAvailableCollaborators(documentId, query),
    enabled: !!documentId && !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
};

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
  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentsApi.restoreVersion(documentId, versionId),
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
