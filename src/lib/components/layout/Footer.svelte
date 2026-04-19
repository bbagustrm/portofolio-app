<script lang="ts">
	import { GithubLogo, LinkedinLogo, Envelope } from 'phosphor-svelte';

	const year = new Date().getFullYear();

	const socials = [
		{ href: 'https://github.com/yourusername', label: 'GitHub', icon: GithubLogo },
		{ href: 'https://linkedin.com/in/yourusername', label: 'LinkedIn', icon: LinkedinLogo },
		{ href: 'mailto:you@email.com', label: 'Email', icon: Envelope }
	];
</script>

<footer class="border-t bg-background">
	<div class="container mx-auto max-w-6xl px-4 py-8">
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
			<p class="text-sm text-muted-foreground">
				© {year} atmojo<span class="text-primary font-bold">.</span>pro — All rights reserved.
			</p>

			<div class="flex items-center gap-2">
				{#each socials as social (social.href)}
					{@const Icon = social.icon}

					<a
						href={social.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={social.label}
						class="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
					>
						<Icon size={18} weight="fill" />
					</a>
				{/each}
			</div>
		</div>
	</div>
</footer>