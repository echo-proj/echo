import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfile, useUpdateProfile } from '@/hooks/useUsers';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';
import { Loader2, User, Mail } from 'lucide-react';
import { useEffect } from 'react';
import styles from './ProfileDialog.module.scss';
import {UpdateProfileFormData, updateProfileSchema} from "@/pages/profile/validations";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      profilePicture: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        profilePicture: profile.profilePicture || '',
      });
    }
  }, [profile, form]);

  const onSubmit = (data: UpdateProfileFormData) => {
    const payload = {
      fullName: data.fullName || undefined,
      phoneNumber: data.phoneNumber || undefined,
      profilePicture: data.profilePicture || undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const validationErrors = updateMutation.isError ? getValidationErrors(updateMutation.error) : null;
  const generalError = updateMutation.isError && !validationErrors ? getErrorMessage(updateMutation.error) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <div className={styles.contentWrapper}>
          <DialogHeader className={styles.header}>
            <DialogTitle className={styles.title}>
              <User className={styles.titleIcon} />
              Profile Management
            </DialogTitle>
            <DialogDescription className={styles.description}>
              Update your profile information. All fields are optional.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader2 className={styles.spinner} />
              <span>Loading profile...</span>
            </div>
          ) : (
            <div className={styles.formWrapper}>
              <div className={styles.userInfo}>
                <div className={styles.infoItem}>
                  <Mail className={styles.infoIcon} />
                  <span className={styles.infoLabel}>Username:</span>
                  <span className={styles.infoValue}>{profile?.username}</span>
                </div>
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
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            disabled={updateMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1234567890"
                            disabled={updateMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profilePicture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/avatar.jpg"
                            disabled={updateMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className={styles.actions}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
