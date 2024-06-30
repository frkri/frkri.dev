<script lang="ts">
	import { Copy, Download } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		content,
		filename = 'file.txt',
		download = false,
		copy = true
	}: {
		children: Snippet;
		content: string;
		filename?: string;
		download?: Boolean;
		copy?: Boolean;
	} = $props();
</script>

<div id="wrapper">
	<menu>
		{#if download}
			<a href={`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`} download={filename}>
				<Download size="1.5ch" />
			</a>
		{/if}
		{#if copy}
			<button onclick={() => navigator.clipboard.writeText(content)}>
				<Copy size="1.5ch" />
			</button>
		{/if}
	</menu>
	<pre>{@render children()}</pre>
</div>

<style>
	#wrapper {
		position: relative;

		margin: 0px;
		padding: 0.8rem;
		border-radius: 0.4rem;

		background-color: var(--background-secondary);
		overflow: scroll;
		max-width: 25rem;
		width: 80dvw;
	}

	menu {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;

		margin: 0px;
		gap: 0.2rem;

		display: flex;
		justify-content: center;
		align-items: center;

		& * {
			display: flex;
			justify-content: center;
			align-items: center;

			padding: 0.3rem;
			border-radius: 0.4rem;
			border-width: 0px;

			background-color: var(--background-secondary);
			color: var(--text-secondary);

			transition: 150ms ease-in-out;
			cursor: pointer;

			&:hover,
			&:focus {
				background-color: var(--background-primary);
				color: var(--text-primary);
			}
		}
	}

	pre {
		margin: 0px;
		padding: 0px;

		font-size: 0.7rem;
		font-family: 'JetBrains Mono', monospace;
	}
</style>
