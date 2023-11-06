<script lang='ts'>
	import type { TreeNodeInternal } from '../internal/node'
	import ItemName from './ItemName.svelte'
  import ToggleButton from './ToggleButton.svelte'

  export let onToggle: () => void
  export let onSelect: () => void
  export let expanded = false
  export let active = false
  export let node: TreeNodeInternal

  $: icon = node.icon
</script>

<div
  role='treeitem'
  aria-selected={active}
  class='relative flex items-center gap-[var(--treeview-node-gap,0.25rem)]'
>
  {#if node.children.length > 0}
    <ToggleButton
      {expanded}
      {onToggle}
    />
  {:else}
    <div class='h-[var(--treeview-toggle-button-size,1.25rem)] w-[var(--treeview-toggle-button-size,1.25rem)]' />
  {/if}

  {#if icon !== undefined}
    <div
      class={`grid place-content-center h-5 w-5 bg-[rgba(0,0,0,0.1)] rounded-full ${'class' in icon ? icon.class : ''}`}
    >
      {#if 'path' in icon}
        <svg class="h-[var(--treeview-icon-size,0.75rem)] w-[var(--treeview-icon-size,0.75rem)]" viewBox="0 0 24 24">
          <path d={icon.path ?? ''} />
        </svg>
      {:else if 'url' in icon}
        <img
          class="h-[var(--treeview-icon-size,0.75rem)] w-[var(--treeview-icon-size,0.75rem)]"
          src={icon.url}
          alt=""
        />
      {/if}
    </div>
  {/if}

  <ItemName
    name={node.name}
    {active}
    {onSelect}
  />
</div>
