import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { documentsApi } from '@/lib/api/documents';
import { AddCollaboratorRequest } from '@/pages/documents/type';

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => usersApi.search(query),
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
};

export const useAddCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: AddCollaboratorRequest }) =>
      documentsApi.addCollaborator(documentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, userId }: { documentId: string; userId: string }) =>
      documentsApi.removeCollaborator(documentId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
