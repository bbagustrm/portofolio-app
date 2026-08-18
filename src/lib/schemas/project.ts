import { z } from 'zod';

export const projectSchema = z.object({
	id: z.string().uuid().optional(),
	title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
	slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
	description: z.string().min(1, 'Description is required').max(500),
	content: z.string().optional(),
	cover_image: z.string().url('Must be a valid URL').optional().nullable(),
	demo_url: z.string().url('Must be a valid URL').optional().nullable(),
	repo_url: z.string().url('Must be a valid URL').optional().nullable(),
	tech_stack: z.array(z.string()).default([]),
	is_featured: z.boolean().default(false),
	is_published: z.boolean().default(false),
	order_index: z.number().int().min(0).default(0),
	locale: z.enum(['en', 'id']).default('en'),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional(),
	owner_id: z.string().uuid().optional()
});

export const projectInputSchema = projectSchema.omit({ 
	id: true, 
	created_at: true, 
	updated_at: true 
});

export const projectUpdateSchema = projectInputSchema.partial();

export type ProjectSchema = z.infer<typeof projectSchema>;
export type ProjectInputSchema = z.infer<typeof projectInputSchema>;
export type ProjectUpdateSchema = z.infer<typeof projectUpdateSchema>;

export function validateProject(data: unknown) {
	return projectSchema.safeParse(data);
}

export function validateProjectInput(data: unknown) {
	return projectInputSchema.safeParse(data);
}

export function validateProjectUpdate(data: unknown) {
	return projectUpdateSchema.safeParse(data);
}
