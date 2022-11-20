import './main.css'
import { Pane, type TpChangeEvent } from 'tweakpane'
import { TreeView, TreeViewItem, resizable } from '../src/main'

// const el = new Resizable()
// el.resizable = 'right'
// document.body.append(el.dom)

const treeview = new TreeView()
treeview.dom.classList.add('sticky', 'top-0')
document.body.append(resizable({
  element: treeview.domElement,
  side: 'right',
  max: Infinity,
  height: 300
}))

const root = new TreeViewItem({ text: `root` })
treeview.append(root)

for (let i = 0; i < 10; i += 1) {
  const item1 = new TreeViewItem({ text: `item ${i}` })
  root.append(item1)
  item1.open = true

  for (let j = 0; j < 5; j += 1) {
    const item2 = new TreeViewItem({ text: `item ${i},${j}` })
    item1.append(item2)
    item2.open = true

    for (let k = 0; k < 3; k += 1) {
      const item3 = new TreeViewItem({ text: `item ${i},${j},${k}` })
      item2.append(item3)
    }
  }
}

const computedStyle = getComputedStyle(treeview.domElement.shadowRoot!.querySelector('style')!)

const cssVar = (name: string) => {
  return computedStyle.getPropertyValue(name)
}

const setCssVar = ({ presetKey, value }: TpChangeEvent<string>) => {
  document.documentElement.style.setProperty(presetKey!, value)
}

const params = {
  '--color-resize-handle': cssVar('--color-resize-handle') || '#dddddd',
  '--color-drag-handle': cssVar('--color-drag-handle') || 'rgba(255,255,255,0.5)',
  '--color-bg': cssVar('--color-bg') || '#28292E',
}

const pane = new Pane()
pane.element.style.width = '350px'
pane.element.style.transform = 'translateX(-100px)'
pane.addInput(params, '--color-resize-handle').on('change', setCssVar)
pane.addInput(params, '--color-drag-handle').on('change', setCssVar)
pane.addInput(params, '--color-bg').on('change', setCssVar)
