<script lang="ts">
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	:global(body) {
		font-family: sans-serif;

		color: var(--text-primary);
		background-color: var(--background-primary);
	}

	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 1.2em 0.4em;
	}
</style>
