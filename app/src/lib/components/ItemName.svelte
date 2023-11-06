<script lang='ts'>
  export let active: boolean
  export let name: string
  export let onSelect: () => void
</script>

<button
  class='name h-5 m-0 py-0 px-2 rounded-sm border-0 bg-[var(--treeview-node-bg-color,#eee)]'
  class:active
  on:click={onSelect}
>
  {name}
</button>

<style>
  button.active {
    background-color: #222;
    color: white;
    fill: white;
  }

  button:hover,
  button:focus-within {
    outline: 2px solid transparent;
    outline-offset: 2px;
    background-color: #555;
    color: white;
    fill: white;
  }
</style>