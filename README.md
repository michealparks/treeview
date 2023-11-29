# treeview-svelte

`treeview-svelte` is a generic tree component. It is easiest to use with Svelte.

```bash
npm i treeview-svelte
```

```svelte
<script>
  import { Treeview } from 'treeview-svelte'
</script>

<Treeview
  nodes={[
    {
      name: 'Animal GIFs',
      id: '0'
      children: [
        {
          name: 'Dogs',
          id: '1',
        }, {
          name: 'Goats',
          id: '2',
        }
      ]
    }
  ]}
/>
```

The `<Treeview>` component has the following properties and events:

```svelte
<script>
  import { Treeview } from 'treeview-svelte'

  let nodes: Node[] = []
</script>

<Treeview
  {nodes}
  on:toggle={(event) => /* Fires when a node is collapsed / expanded */}
  on:select={(event) => /* Fires when a node is selected */}
  on:deselect={(event) => /* Fires when a node is deselected */}
  on:reparent={(event) => /* Fires when a node is reparented */}
>
```

## Developing

```bash
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
