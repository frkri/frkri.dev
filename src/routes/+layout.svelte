<script lang="ts">
	import { version } from '$app/environment';
	import Doodle from '$lib/components/doodle/Doodle.svelte';
	import '../app.css';
	import '../global.css';

	const repo = 'https://github.com/frkri/frkri.dev/commit/' + version;
</script>

<svelte:head>
	<title>Frkri</title>
</svelte:head>

<main>
	<slot />
</main>
<Doodle />
<a href={repo} tabindex="-1" aria-hidden="true">{version}</a>

<style>
	main {
		margin: 2.5em 0.8em;
	}

	a {
		position: fixed;
		bottom: 0.2em;
		left: 0.2em;

		opacity: 0;
		font-size: 0.2em;

		color: var(--text-quaternary);
		text-decoration: none;

		&:hover {
			opacity: 0.5;
			color: var(--text-secondary);
		}
	}
</style>
