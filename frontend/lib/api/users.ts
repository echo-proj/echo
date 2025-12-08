import { axiosInstance } from '../axios';
import { UserSearchResult } from '@/pages/documents/type';

export const usersApi = {
  search: async (query: string): Promise<UserSearchResult[]> => {
    const response = await axiosInstance.get('/api/profile/search', {
      params: { query },
    });
    return response.data;
  },
};
