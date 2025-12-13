import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'next/router';
import {authApi, LoginRequest, RegisterRequest} from '@/lib/api/auth';
import {authStorage} from '@/lib/auth';

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (data) => {
            authStorage.setAuthData(data.token, data.username);
            router.push('/documents');
        },
    });
};

export const useRegister = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (data) => {
            authStorage.setAuthData(data.token, data.username);
            router.push('/documents');
        },
    });
};