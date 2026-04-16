<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import {
		Bold, Italic, Heading2, Heading3,
		List, ListOrdered, Quote, Code, Link as LinkIcon,
		Image as ImageIcon, Minus
	} from '@lucide/svelte';

	let {
		content = '',
		onchange
	} = $props<{
		content?: string;
		onchange?: (html: string) => void;
	}>();

	let element = $state<HTMLDivElement | null>(null);
	let editor = $state<Editor | null>(null);
	let isFocused = $state(false);

	onMount(() => {
		if (!element) return;

		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Image.configure({ inline: false }),
				Link.configure({ openOnClick: false }),
				Placeholder.configure({ placeholder: 'Start writing your article...' })
			],
			content,
			onUpdate({ editor }) {
				onchange?.(editor.getHTML());
			},
			onFocus() { isFocused = true; },
			onBlur() { isFocused = false; }
		});
	});

	onDestroy(() => editor?.destroy());

	function toggleLink() {
		if (!editor) return;
		const url = window.prompt('Enter URL:');
		if (!url) return;
		editor.chain().focus().setLink({ href: url }).run();
	}

	type ToolbarItem =
		| { type: 'button'; action: () => void; active: () => boolean; icon: any; title: string }
		| { type: 'separator' };

	function getToolbar(): ToolbarItem[] {
		if (!editor) return [];
		return [
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleBold().run(),
				active: () => editor!.isActive('bold'),
				icon: Bold,
				title: 'Bold'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleItalic().run(),
				active: () => editor!.isActive('italic'),
				icon: Italic,
				title: 'Italic'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleHeading({ level: 2 }).run(),
				active: () => editor!.isActive('heading', { level: 2 }),
				icon: Heading2,
				title: 'Heading 2'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleHeading({ level: 3 }).run(),
				active: () => editor!.isActive('heading', { level: 3 }),
				icon: Heading3,
				title: 'Heading 3'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleBulletList().run(),
				active: () => editor!.isActive('bulletList'),
				icon: List,
				title: 'Bullet List'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleOrderedList().run(),
				active: () => editor!.isActive('orderedList'),
				icon: ListOrdered,
				title: 'Ordered List'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleBlockquote().run(),
				active: () => editor!.isActive('blockquote'),
				icon: Quote,
				title: 'Blockquote'
			},
			{
				type: 'button',
				action: () => editor!.chain().focus().toggleCodeBlock().run(),
				active: () => editor!.isActive('codeBlock'),
				icon: Code,
				title: 'Code Block'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: toggleLink,
				active: () => editor!.isActive('link'),
				icon: LinkIcon,
				title: 'Link'
			},
			{
				type: 'button',
				action: () => {
					const url = window.prompt('Image URL:');
					if (url) editor!.chain().focus().setImage({ src: url }).run();
				},
				active: () => false,
				icon: ImageIcon,
				title: 'Image'
			},
			{ type: 'separator' },
			{
				type: 'button',
				action: () => editor!.chain().focus().setHorizontalRule().run(),
				active: () => false,
				icon: Minus,
				title: 'Divider'
			}
		];
	}
</script>

<div class="border rounded-xl overflow-hidden {isFocused ? 'ring-2 ring-ring' : ''}">
	<!-- Toolbar -->
	{#if editor}
		{@const toolbar = getToolbar()}
		<div class="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
			{#each toolbar as item}
				{#if item.type === 'separator'}
					<div class="w-px h-5 bg-border mx-1"></div>
				{:else if item.type === 'button'}
					{@const Icon = item.icon}
					<button
						type="button"
						onclick={item.action}
						title={item.title}
						class="p-1.5 rounded-md transition-colors text-sm
							{item.active()
								? 'bg-primary text-primary-foreground'
								: 'hover:bg-muted text-muted-foreground hover:text-foreground'}"
					>
						<Icon class="size-4" />
					</button>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- Editor area -->
	<div
		bind:this={element}
		class="prose prose-neutral dark:prose-invert max-w-none min-h-64 p-4
			prose-headings:font-bold prose-a:text-primary
			focus-within:outline-none [&_.ProseMirror]:outline-none
			[&_.ProseMirror]:min-h-64"
	></div>
</div>

<!-- Hidden input to submit HTML content -->
<input type="hidden" name="content" value={editor?.getHTML() ?? content} />

<style>
    :global(.ProseMirror p.is-editor-empty:first-child::before) {
        content: attr(data-placeholder);
        float: left;
        color: var(--color-muted-foreground);
        pointer-events: none;
        height: 0;
    }
</style>