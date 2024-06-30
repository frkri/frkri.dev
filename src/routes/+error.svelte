<script lang="ts">
	import { page } from '$app/stores';
	import LinkButton from '$lib/components/LinkButton.svelte';
</script>

<div>
	<h1>{$page.status}</h1>
	<span>{$page.error?.message}</span>
	<LinkButton name="Return" href="/" />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-self: center;
	}

	h1 {
		font-size: 5em;
		font-weight: 800;
		margin-bottom: 0px;
	}

	span {
		font-size: 1.4em;
		margin-bottom: 1.5em;
	}
</style>
