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
		bottom: 0.5em;
		left: 0.5em;

		font-size: 0.3em;
		text-decoration: none;
		color: var(--text-quaternary);

		&:hover {
			color: var(--text-secondary);
		}
	}
</style>
