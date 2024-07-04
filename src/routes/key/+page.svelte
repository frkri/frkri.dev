<script lang="ts">
	import { page } from '$app/stores';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import key from '$lib/assets/key/frkri.asc?raw';

	const cmd = `curl ` + $page.url.toString() + ` | gpg --import`;
</script>

<section>
	<h1>PGP Key</h1>
	<div>
		<CodeBlock content={cmd} download={false} title="Import the key with">
			<code>{cmd}</code>
		</CodeBlock>
	</div>
	<div>
		<CodeBlock title="frkri.asc" content={key}>{key}</CodeBlock>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}
</style>
