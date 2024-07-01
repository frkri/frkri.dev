<script lang="ts">
	import { Copy, Download } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		content,
		filename,
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
	<div id="file">
		{#if filename}
			<span>
				{filename}
			</span>
		{/if}
		<menu>
			{#if download}
				<a
					href={`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`}
					download={filename}
				>
					<Download size="1.5ch" />
				</a>
			{/if}
			{#if copy}
				<button onclick={() => navigator.clipboard.writeText(content)}>
					<Copy size="1.5ch" />
				</button>
			{/if}
		</menu>
	</div>
	<pre>{@render children()}</pre>
</div>

<style>
	#wrapper {
		display: flex;
		flex-direction: column;

		margin: 0px;
		border-radius: 0.4rem;

		max-width: 25rem;
		width: 80dvw;
	}

	#file {
		display: flex;
		justify-content: end;
		align-items: center;
		height: 1.3rem;

		span {
			font-size: 0.8rem;
			font-weight: 500;
			height: 100%;

			padding-right: 0.6rem;
			padding-left: 0.6rem;
		}

		* {
			background-color: var(--background-secondary);
			padding: 0.2rem;

			border-top-left-radius: 0.4rem;
			border-top-right-radius: 0.4rem;
		}
	}

	menu {
		display: flex;
		flex-direction: row;
		align-items: center;

		margin: 0px;
		margin-left: auto;
		gap: 0.2rem;

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
				background-color: var(--background-primary) !important;
				color: var(--text-primary);
			}
		}
	}

	pre {
		margin: 0px;
		padding: 1rem;
		overflow-x: auto;

		font-size: 0.7rem;
		font-family: 'JetBrains Mono', monospace;
		background-color: var(--background-secondary);
	}
</style>
