<script lang="ts">
	import { version } from '$app/environment';
	import '../app.css';
	import '../global.css';

	const repo = 'https://github.com/frkri/frkri.dev/commit/';
</script>

<svelte:head>
	<title>Frkri</title>
</svelte:head>

<div>
	<main>
		<slot />
	</main>
	<footer>
		<a id="hash" href={repo + version}>{version}</a>
	</footer>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;

		margin: 0.4em;
		min-height: 100dvh;
	}

	main {
		flex: 1 0;
		max-width: 1000px;

		padding: 1.2em 0.6em;
	}

	#hash {
		font-size: 0.4em;
		text-decoration: none;
		color: var(--text-quaternary);

		&:hover {
			color: var(--text-secondary);
		}
	}
</style>
