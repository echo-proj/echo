import { axiosInstance } from '../axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/auth/register', data);
    return response.data;
  },
};
