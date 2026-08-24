<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { reveal } from '$lib/actions/reveal';
  import * as m from '$paraglide/messages';

  let { status } = $derived($page);
</script>

<svelte:head>
  <title>{status === 404 ? m.error_404_title() : m.error_500_title()} — Atmojo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="text-center max-w-md">
    <div use:reveal={{ scale: 0.9, duration: 0.6 }}>
      <p class="text-9xl font-bold text-primary opacity-20">{status}</p>
    </div>
    <div use:reveal={{ y: 20, delay: 0.2 }}>
      <h1 class="text-3xl font-bold mb-3">
        {status === 404 ? m.error_404_title() : m.error_500_title()}
      </h1>
      <p class="text-muted-foreground mb-8">
        {status === 404 ? m.error_404_message() : m.error_500_message()}
      </p>
      <a href="/">
        <Button size="lg">
          {status === 404 ? m.error_404_cta() : m.error_500_cta()}
        </Button>
      </a>
    </div>
  </div>
</div>
