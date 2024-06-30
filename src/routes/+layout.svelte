<script lang="ts">
	import '../app.css';
	import '../global.css';
</script>

<svelte:head>
	<title>Frkri</title>
</svelte:head>

<main>
	<slot />
</main>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 1.2em 0.4em;
	}
</style>
