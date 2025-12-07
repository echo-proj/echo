import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRegister } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils/errorHandler';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import styles from './Register.module.scss';

export default function Register() {
  const registerMutation = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <h1>Create Account</h1>
          <p>Get started with Echo today</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            {registerMutation.isError && (
              <div className={styles.error}>
                {getErrorMessage(registerMutation.error, 'Failed to create account. Please try again.')}
              </div>
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={registerMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Choose a username"
                      disabled={registerMutation.isPending}
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
                      placeholder="Create a strong password"
                      disabled={registerMutation.isPending}
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
