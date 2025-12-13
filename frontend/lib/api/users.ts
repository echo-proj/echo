import { axiosInstance } from '../axios';
import { UserSearchResult } from '@/pages/documents/type';
import {UpdateProfileRequest, UserProfile} from "@/pages/profile/types";

export const usersApi = {
  search: async (query: string): Promise<UserSearchResult[]> => {
    const response = await axiosInstance.get('/api/profile/search', {
      params: { query },
    });
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/api/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await axiosInstance.put('/api/profile', data);
    return response.data;
  },
};
