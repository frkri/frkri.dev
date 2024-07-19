<script lang="ts">
	import { Copy } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		content,
		download = true,
		title
	}: {
		children: Snippet;
		content: string;
		title?: string;
		download?: boolean;
	} = $props();
</script>

<div>
	<menu>
		{#if download}
			<a
				title="Download {title}"
				href={`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`}
				download={title}
			>
				{title}
			</a>
		{:else}
			<span>{title}</span>
		{/if}
		<button title="Copy to clipboard" onclick={() => navigator.clipboard.writeText(content)}>
			<Copy size="1.5ch" />
		</button>
	</menu>
	<pre>{@render children()}</pre>
</div>

<style>
	div {
		margin: 0px;
		border-radius: 0.4rem;
		max-width: calc(100vw - 1.6rem);

		background-color: var(--background-secondary);
	}

	menu {
		display: flex;
		flex-direction: row;
		align-items: center;

		margin: 0px;
		padding: 0.4rem;

		& * {
			padding: 0.3rem;
			border-radius: 0.4rem;
			border-width: 0px;

			font-size: 1.2ch;
			font-weight: 600;
			text-decoration: none;

			background-color: var(--background-secondary);
			color: var(--text-secondary);
		}

		& a,
		& button {
			transition-property: background-color, color;
			transition-duration: 150ms;
			cursor: pointer;

			&:hover,
			&:focus {
				background-color: var(--background-primary);
				color: var(--text-primary);
			}
		}

		& button {
			display: grid;
			place-items: center;

			margin-left: auto;
		}
	}

	pre {
		margin: 0px;
		padding: 0.6rem;
		padding-top: 0px;

		font-size: 1ch;
		line-height: 1rem;
		background-color: var(--background-secondary);

		overflow-x: auto;
	}
</style>
