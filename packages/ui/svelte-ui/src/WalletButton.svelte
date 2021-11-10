<script lang="ts">
	export let disabled: boolean = false;

	let className: string = '';
	export { className as class };

	let justifyContent: string =
		$$slots['end-icon'] || $$slots['start-icon'] ? 'space-between' : 'center';
</script>

<button
	class="wallet-adapter-button {className}"
	style={`justify-content: ${justifyContent};`}
	{disabled}
	on:click
>
	{#if $$slots['start-icon']}
		<i class="wallet-adapter-button-start-icon">
			<slot name="start-icon" />
		</i>
	{/if}
	<slot />
	{#if $$slots['end-icon']}
		<i class="wallet-adapter-button-end-icon">
			<slot name="end-icon" />
		</i>
	{/if}
</button>
