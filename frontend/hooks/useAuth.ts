import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api/auth';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('username', data.username);
      router.push('/documents');
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('username', data.username);
      router.push('/documents');
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    router.push('/login');
  };
};
