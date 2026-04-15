<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Eye, EyeOff, LogIn } from 'lucide-svelte';

	let { form } = $props();

	let loading = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Login — Portfolio</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 bg-background">
	<div class="w-full max-w-md">
		<!-- Logo / Title -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
			<p class="text-muted-foreground mt-2">Sign in to access your dashboard</p>
		</div>

		<Card class="shadow-lg">
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Enter your credentials to continue</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
					class="space-y-4"
				>
					<!-- Email -->
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="you@example.com"
							required
							autocomplete="email"
						/>
					</div>

					<!-- Password -->
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<div class="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								required
								autocomplete="current-password"
								class="pr-10"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Toggle password visibility"
							>
								{#if showPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</div>

					<!-- Submit -->
					<Button type="submit" class="w-full" disabled={loading}>
						{#if loading}
							<span class="animate-spin mr-2">⏳</span> Signing in...
						{:else}
							<LogIn class="size-4 mr-2" />
							Sign In
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>
	</div>
</div>