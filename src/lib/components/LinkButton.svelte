<script lang="ts">
	import { ArrowRight, ExternalLink } from 'lucide-svelte';

	let { name, href = '/', rel = '' } = $props();
	const outgoing = href.startsWith('http');
</script>

<a {href} target={outgoing ? '_blank' : '_self'} {rel}>
	{name}
	<span id="icon">
		{#if outgoing}
			<ExternalLink size="1em" />
		{:else}
			<ArrowRight size="1em" />
		{/if}
	</span>
</a>

<style>
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0em;

		color: var(--link-unvisited);
		background-color: #213c5925;
		font-size: 1.4rem;
		font-weight: 600;

		padding: 0.3em;
		border-radius: 12px;
		max-width: fit-content;

		transition: all 200ms ease-in-out;
		text-decoration: none;

		&:hover,
		&:focus {
			color: var(--link-unvisited);
			background-color: #35619066;
			gap: 0.6em;
		}

		#icon {
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 150ms ease-in-out;

			width: 0px;
			opacity: 0%;
		}

		&:hover #icon,
		&:focus #icon {
			opacity: 100%;
			width: 1em;
		}
	}
</style>
