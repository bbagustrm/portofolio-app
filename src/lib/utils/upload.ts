import type { SupabaseClient } from '@supabase/supabase-js';

export type UploadBucket = 'avatars' | 'portfolio' | 'blog' | 'gallery';

export type UploadResult = {
	url: string;
	path: string;
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export function validateFile(file: File): { valid: boolean; error?: string } {
	const isImage = IMAGE_TYPES.includes(file.type);
	const isVideo = VIDEO_TYPES.includes(file.type);

	if (!isImage && !isVideo) {
		return {
			valid: false,
			error: `File type not supported: ${file.type}. Use JPEG, PNG, WebP, GIF, MP4, or WebM.`
		};
	}

	if (isImage && file.size > MAX_IMAGE_SIZE) {
		return { valid: false, error: 'Image must be under 10MB.' };
	}

	if (isVideo && file.size > MAX_VIDEO_SIZE) {
		return { valid: false, error: 'Video must be under 100MB.' };
	}

	return { valid: true };
}

export function getFileType(file: File): 'image' | 'video' {
	return VIDEO_TYPES.includes(file.type) ? 'video' : 'image';
}

export async function uploadFile(
	supabase: SupabaseClient,
	file: File,
	bucket: UploadBucket,
	folder: string = ''
): Promise<UploadResult> {
	const validation = validateFile(file);
	if (!validation.valid) throw new Error(validation.error);

	// Generate unique path
	const ext = file.name.split('.').pop() ?? 'bin';
	const uniqueName = `${crypto.randomUUID()}.${ext}`;
	const path = folder ? `${folder}/${uniqueName}` : uniqueName;

	const { error } = await supabase.storage.from(bucket).upload(path, file, {
		cacheControl: '3600',
		upsert: false
	});

	if (error) throw new Error(`Upload failed: ${error.message}`);

	const url = getPublicUrl(supabase, bucket, path);
	return { url, path };
}

export function getPublicUrl(supabase: SupabaseClient, bucket: UploadBucket, path: string): string {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}

export async function deleteFile(
	supabase: SupabaseClient,
	bucket: UploadBucket,
	path: string
): Promise<void> {
	const { error } = await supabase.storage.from(bucket).remove([path]);
	if (error) throw new Error(`Delete failed: ${error.message}`);
}
