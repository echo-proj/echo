import { z } from 'zod';

export const updateProfileSchema = z.object({
    fullName: z.string().max(255, 'Full name must be less than 255 characters').optional().or(z.literal('')),
    phoneNumber: z.string().max(20, 'Phone number must be less than 20 characters').optional().or(z.literal('')),
    profilePicture: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
