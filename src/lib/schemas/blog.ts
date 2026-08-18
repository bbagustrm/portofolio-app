import { z } from 'zod';

export const blogPostSchema = z.object({
	id: z.string().uuid().optional(),
	title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
	slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
	excerpt: z.string().max(500, 'Excerpt too long').optional().nullable(),
	content: z.string().min(1, 'Content is required'),
	cover_image: z.string().url('Must be a valid URL').optional().nullable(),
	reading_time: z.number().int().min(1).optional().nullable(),
	is_published: z.boolean().default(false),
	published_at: z.string().datetime().optional().nullable(),
	locale: z.enum(['en', 'id']).default('en'),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional(),
	owner_id: z.string().uuid().optional()
});

export const blogPostInputSchema = blogPostSchema.omit({ 
	id: true, 
	created_at: true, 
	updated_at: true,
	reading_time: true
});

export const blogPostUpdateSchema = blogPostInputSchema.partial();

export const tagSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(1, 'Tag name is required').max(50),
	slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
	created_at: z.string().datetime().optional()
});

export const tagInputSchema = tagSchema.omit({ 
	id: true, 
	created_at: true 
});

export type BlogPostSchema = z.infer<typeof blogPostSchema>;
export type BlogPostInputSchema = z.infer<typeof blogPostInputSchema>;
export type BlogPostUpdateSchema = z.infer<typeof blogPostUpdateSchema>;
export type TagSchema = z.infer<typeof tagSchema>;
export type TagInputSchema = z.infer<typeof tagInputSchema>;

export function validateBlogPost(data: unknown) {
	return blogPostSchema.safeParse(data);
}

export function validateBlogPostInput(data: unknown) {
	return blogPostInputSchema.safeParse(data);
}

export function validateBlogPostUpdate(data: unknown) {
	return blogPostUpdateSchema.safeParse(data);
}

export function validateTag(data: unknown) {
	return tagSchema.safeParse(data);
}

export function validateTagInput(data: unknown) {
	return tagInputSchema.safeParse(data);
}
