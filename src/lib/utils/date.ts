export function formatDate(date: string | Date): string {
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
	return new Intl.DateTimeFormat('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
	const now = new Date();
	const past = new Date(date);
	const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

	const intervals: [number, string][] = [
		[60, 'just now'],
		[120, '1 minute ago'],
		[3600, `${Math.floor(seconds / 60)} minutes ago`],
		[7200, '1 hour ago'],
		[86400, `${Math.floor(seconds / 3600)} hours ago`],
		[172800, 'yesterday'],
		[604800, `${Math.floor(seconds / 86400)} days ago`],
		[1209600, 'last week'],
		[2592000, `${Math.floor(seconds / 604800)} weeks ago`],
		[5184000, 'last month'],
		[31536000, `${Math.floor(seconds / 2592000)} months ago`],
		[Infinity, `${Math.floor(seconds / 31536000)} years ago`]
	];

	for (const [threshold, label] of intervals) {
		if (seconds < threshold) return label;
	}

	return formatDateShort(date);
}

export function estimateReadingTime(content: string): string {
	// Strip HTML tags kalau ada
	const text = content.replace(/<[^>]*>/g, '');
	const words = text.trim().split(/\s+/).length;
	const minutes = Math.ceil(words / 200);
	return minutes <= 1 ? '1 min read' : `${minutes} min read`;
}
