import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLogin } from '@/hooks/useAuth';
import { getErrorMessage, getValidationErrors } from '@/lib/utils/errorHandler';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import styles from './Login.module.scss';

export default function Login() {
  const loginMutation = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Set server-side validation errors on form fields
  useEffect(() => {
    if (loginMutation.isError) {
      const validationErrors = getValidationErrors(loginMutation.error);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof LoginFormData, {
            type: 'server',
            message,
          });
        });
      }
    }
  }, [loginMutation.isError, loginMutation.error, form]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Echo</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            {loginMutation.isError && !getValidationErrors(loginMutation.error) && (
              <div className={styles.error}>
                {getErrorMessage(loginMutation.error, 'Invalid username or password. Please try again.')}
              </div>
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      disabled={loginMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      disabled={loginMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className={styles.submitBtn}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className={styles.footer}>
          <p>
            Do not have an account?{' '}
            <Link href="/register" className={styles.link}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
