<script lang="ts">
	import { Treeview } from '$lib'
	import { onMount } from 'svelte'
	import { nodes } from './nodes'
	import { useTweakpane } from './useTweakpane'

	const { action, addInput } = useTweakpane({
		title: 'CSS Variables',
		expanded: true,
	})

	let select: (id: string) => void

	const keys = {
		connectorLinesColor: '--treeview-connector-lines-color',
		toggleIconSize: '--treeview-toggle-icon-size',
		iconSize: '--treeview-icon-size',
		toggleButtonSize: '--treeview-toggle-button-size',
		listMargin: '--treeview-list-margin',
		nodeGap: '--treeview-node-gap',
		nodeBgColor: '--treeview-node-bg-color',
		toggleButtonBgColor: '--treeview-toggle-button-bg-color',
	}

	const toggleIconSize = addInput({
		label: keys.toggleIconSize,
		value: '1rem',
	})

	const toggleButtonSize = addInput({
		label: keys.toggleButtonSize,
		value: '1.25rem',
	})

	const connectorLinesColor = addInput({
		label: keys.connectorLinesColor,
		value: '#ccccccff',
	})

	const listMargin = addInput({
		label: keys.listMargin,
		value: '0rem',
	})

	const nodeGap = addInput({
		label: keys.nodeGap,
		value: '0.25rem',
	})

	const nodeBgColor = addInput({
		label: keys.nodeBgColor,
		value: '#eeeeeeff',
	})

	const togglButtonBgColor = addInput({
		label: keys.nodeBgColor,
		value: '#eeeeeeff',
	})

	$: style = `
    ${keys.toggleIconSize}:${$toggleIconSize};
    ${keys.toggleButtonSize}:${$toggleButtonSize};
    ${keys.connectorLinesColor}:${$connectorLinesColor};
    ${keys.listMargin}:${$listMargin};
    ${keys.nodeGap}:${$nodeGap};
    ${keys.nodeBgColor}:${$nodeBgColor};
    ${keys.toggleButtonBgColor}:${$togglButtonBgColor};
  `

	onMount(() => select('bob'))
</script>

<div use:action />

<main>
	<Treeview
		{style}
		bind:select
		{nodes}
		on:select={(event) => console.log('select', event)}
		on:deselect={(event) => console.log('deselect', event)}
		on:reparent={(event) => console.log('reparent', event)}
		on:toggle={(event) => console.log('toggle', event)}
	/>
</main>

<style>
	:global(body) {
		font-family: system-ui;
	}

	main {
		max-width: 400px;
		background-color: #eee;
		overflow: auto;
	}
</style>
