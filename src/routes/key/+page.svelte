<script lang="ts">
	import { page } from '$app/stores';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import key from '$lib/assets/key/frkri.asc?raw';

	const cmd = `curl ` + $page.url.toString() + ` | gpg --import`;
</script>

<section>
	<h1>PGP Key</h1>
	<div>
		<CodeBlock filename="frkri.asc" download={true} content={key}>{key}</CodeBlock>
	</div>
	<div>
		<p>Import the key with</p>
		<CodeBlock content={cmd}>
			<code>{cmd}</code>
		</CodeBlock>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;

		div {
			max-height: 40ch;
			overflow: scroll;

			p {
				text-align: center;
			}
		}
	}
</style>
