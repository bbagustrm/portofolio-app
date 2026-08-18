import type { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> = 
	Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> = 
	Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> = 
	Database['public']['Tables'][T]['Update'];

export type DbProject = Tables<'projects'>;
export type DbBlogPost = Tables<'blog_posts'>;
export type DbPost = Tables<'posts'>;
export type DbProfile = Tables<'profiles'>;
export type DbMedia = Tables<'media'>;
export type DbTag = Tables<'tags'>;

// TODO: Migrate to generated types above
// These manual types will be gradually replaced with DbProject, DbBlogPost, etc.
export type Project = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	content: string | null;
	cover_url: string | null;
	tech_stack: string[] | null;
	demo_url: string | null;
	repo_url: string | null;
	is_featured: boolean;
	is_published: boolean;
	order_index: number;
	locale: string | null;
	created_at: string;
	updated_at: string;
};

export type BlogPost = {
	id: string;
	title: string;
	slug: string;
	content: string | null;
	excerpt: string | null;
	cover_url: string | null;
	is_published: boolean;
	published_at: string | null;
	locale: string | null;
	created_at: string;
	updated_at: string;
	tags?: Tag[];
};

export type Tag = {
	id: string;
	name: string;
	slug: string;
};

export type Post = {
	id: string;
	caption: string | null;
	mood: string | null;
	is_published: boolean;
	is_archived: boolean;
	locale: string | null;
	created_at: string;
	updated_at: string;
	media?: Media[];
};

export type Media = {
	id: string;
	post_id: string;
	storage_path: string;
	url: string;
	type: 'image' | 'video';
	size: number | null;
	order_index: number;
	created_at: string;
};

export type Profile = {
	id: string;
	full_name: string | null;
	bio: string | null;
	avatar_url: string | null;
	github_url: string | null;
	linkedin_url: string | null;
	website_url: string | null;
	created_at: string;
	updated_at: string;
};

// Input types untuk create/update
export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'tags'>;
export type PostInput = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'media'>;
export type ProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;