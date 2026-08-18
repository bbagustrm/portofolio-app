import { z } from 'zod';

export const profileSchema = z.object({
	id: z.string().uuid(),
	full_name: z.string().min(1, 'Full name is required').max(100),
	bio: z.string().max(500).optional().nullable(),
	avatar_url: z.string().url('Must be a valid URL').optional().nullable(),
	location: z.string().max(100).optional().nullable(),
	website: z.string().url('Must be a valid URL').optional().nullable(),
	github_url: z.string().url('Must be a valid URL').optional().nullable(),
	linkedin_url: z.string().url('Must be a valid URL').optional().nullable(),
	twitter_url: z.string().url('Must be a valid URL').optional().nullable(),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional()
});

export const profileInputSchema = profileSchema.omit({ 
	id: true, 
	created_at: true, 
	updated_at: true 
});

export const profileUpdateSchema = profileInputSchema.partial();

export type ProfileSchema = z.infer<typeof profileSchema>;
export type ProfileInputSchema = z.infer<typeof profileInputSchema>;
export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

export function validateProfile(data: unknown) {
	return profileSchema.safeParse(data);
}

export function validateProfileInput(data: unknown) {
	return profileInputSchema.safeParse(data);
}

export function validateProfileUpdate(data: unknown) {
	return profileUpdateSchema.safeParse(data);
}
