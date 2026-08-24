import { skillCategories } from './skills';

export type TechItem = {
	name: string;
	logo: string;
};

const featuredTechNames = [
	'SvelteKit',
	'TypeScript',
	'React',
	'Next.js',
	'NestJS',
	'Tailwind CSS',
	'PostgreSQL',
	'Supabase',
	'Docker',
	'Spring Boot'
];

export const techStack: TechItem[] = skillCategories
	.flatMap((cat) => cat.skills)
	.filter((skill) => featuredTechNames.includes(skill.name));
