import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLogin } from '@/hooks/useAuth';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';
import styles from './Login.module.scss';
import {LoginFormData, loginSchema} from "@/pages/login/validations";

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

  const validationErrors = loginMutation.isError ? getValidationErrors(loginMutation.error) : null;
  const generalError = loginMutation.isError && !validationErrors ? getErrorMessage(loginMutation.error) : null;

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Echo</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            {(validationErrors || generalError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {validationErrors && (
                    <ul className="list-inside list-disc text-sm">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  )}
                  {generalError && <p>{generalError}</p>}
                </AlertDescription>
              </Alert>
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
