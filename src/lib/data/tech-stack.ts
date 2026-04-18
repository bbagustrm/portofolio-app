export type TechItem = {
	name: string;
	logo: string; // URL ke SVG
};

export const techStack: TechItem[] = [
	{
		name: 'SvelteKit',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg'
	},
	{
		name: 'TypeScript',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg'
	},
	{
		name: 'Node.js',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg'
	},
	{
		name: 'PostgreSQL',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg'
	},
	{
		name: 'Docker',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg'
	},
	{
		name: 'Tailwind CSS',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg'
	},
	{
		name: 'NestJS',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/NestJS.svg'
	},
	{
		name: 'Next.js',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg'
	}
];