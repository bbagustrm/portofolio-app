export type SkillCategory = {
	title: string;
	titleKey: string;
	skills: { name: string; logo: string }[];
};

export const skillCategories: SkillCategory[] = [
	{
		title: 'Software Development',
		titleKey: 'skills_category_software_dev',
		skills: [
			{
				name: 'PHP',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg'
			},
			{
				name: 'JavaScript',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'
			},
			{
				name: 'TypeScript',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg'
			},
			{
				name: 'Java',
				logo: 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg'
			},
			{
				name: 'Spring Boot',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Spring_Boot.svg'
			},
			{
				name: 'Laravel',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Laravel.svg'
			},
			{
				name: 'React',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg'
			},
			{
				name: 'Next.js',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg'
			},
			{
				name: 'NestJS',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/NestJS.svg'
			},
			{
				name: 'SvelteKit',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg'
			},
			{
				name: 'Tailwind CSS',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg'
			},
			{
				name: 'MySQL',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/MySQL_textlogo.svg'
			},
			{
				name: 'PostgreSQL',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg'
			},
			{
				name: 'MongoDB',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg'
			},
			{
				name: 'Supabase',
				logo: 'https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png'
			},
			{
				name: 'Git',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg'
			},
			{
				name: 'GitHub',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
			},
			{
				name: 'GitLab',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg'
			}
		]
	},
	{
		title: 'Graphic Design',
		titleKey: 'skills_category_graphic_design',
		skills: [
			{
				name: 'Adobe Illustrator',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg'
			},
			{
				name: 'Adobe Photoshop',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg'
			},
			{
				name: 'Adobe After Effects',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Adobe_After_Effects_CC_icon.svg'
			},
			{
				name: 'Adobe InDesign',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Adobe_InDesign_CC_icon.svg'
			},
			{
				name: 'Adobe Premiere Pro',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Adobe_Premiere_Pro_CC_icon.svg'
			},
			{
				name: 'CorelDRAW',
				logo: 'https://seeklogo.com/images/C/coreldraw-logo-28882DCC3E-seeklogo.com.png'
			},
			{
				name: 'Figma',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
			},
			{
				name: 'Affinity Designer',
				logo: 'https://seeklogo.com/images/A/affinity-designer-logo-5D4CCFEE96-seeklogo.com.png'
			},
			{
				name: 'Canva',
				logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg'
			},
			{
				name: 'CapCut',
				logo: 'https://seeklogo.com/images/C/capcut-logo-E9BBFF5797-seeklogo.com.png'
			}
		]
	}
];
