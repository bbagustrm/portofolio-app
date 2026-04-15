export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')   // hapus karakter spesial
		.replace(/[\s_]+/g, '-')    // spasi/underscore → dash
		.replace(/--+/g, '-')       // multiple dash → single
		.replace(/^-+|-+$/g, '');   // trim dash di awal/akhir
}

export async function ensureUniqueSlug(
	supabase: any,
	slug: string,
	table: 'projects' | 'blog_posts'
): Promise<string> {
	const { data } = await supabase
		.from(table)
		.select('slug')
		.eq('slug', slug)
		.maybeSingle();

	if (!data) return slug; // slug masih available

	// Coba append angka: slug-2, slug-3, dst
	let counter = 2;
	while (true) {
		const candidate = `${slug}-${counter}`;
		const { data: existing } = await supabase
			.from(table)
			.select('slug')
			.eq('slug', candidate)
			.maybeSingle();

		if (!existing) return candidate;
		counter++;
	}
}