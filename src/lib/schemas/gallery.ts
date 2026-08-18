import { z } from 'zod';

export const galleryPostSchema = z.object({
	id: z.string().uuid().optional(),
	title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
	description: z.string().max(1000, 'Description too long').optional().nullable(),
	location: z.string().max(200).optional().nullable(),
	taken_at: z.string().datetime().optional().nullable(),
	is_published: z.boolean().default(false),
	is_archived: z.boolean().default(false),
	locale: z.enum(['en', 'id']).default('en'),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional(),
	owner_id: z.string().uuid().optional()
});

export const galleryPostInputSchema = galleryPostSchema.omit({ 
	id: true, 
	created_at: true, 
	updated_at: true 
});

export const galleryPostUpdateSchema = galleryPostInputSchema.partial();

export const mediaSchema = z.object({
	id: z.string().uuid().optional(),
	post_id: z.string().uuid(),
	storage_path: z.string().min(1, 'Storage path is required'),
	url: z.string().url('Must be a valid URL'),
	type: z.enum(['image', 'video']),
	size: z.number().int().min(0),
	width: z.number().int().min(1).optional().nullable(),
	height: z.number().int().min(1).optional().nullable(),
	order_index: z.number().int().min(0).default(0),
	created_at: z.string().datetime().optional()
});

export const mediaInputSchema = mediaSchema.omit({ 
	id: true, 
	created_at: true 
});

export type GalleryPostSchema = z.infer<typeof galleryPostSchema>;
export type GalleryPostInputSchema = z.infer<typeof galleryPostInputSchema>;
export type GalleryPostUpdateSchema = z.infer<typeof galleryPostUpdateSchema>;
export type MediaSchema = z.infer<typeof mediaSchema>;
export type MediaInputSchema = z.infer<typeof mediaInputSchema>;

export function validateGalleryPost(data: unknown) {
	return galleryPostSchema.safeParse(data);
}

export function validateGalleryPostInput(data: unknown) {
	return galleryPostInputSchema.safeParse(data);
}

export function validateGalleryPostUpdate(data: unknown) {
	return galleryPostUpdateSchema.safeParse(data);
}

export function validateMedia(data: unknown) {
	return mediaSchema.safeParse(data);
}

export function validateMediaInput(data: unknown) {
	return mediaInputSchema.safeParse(data);
}
