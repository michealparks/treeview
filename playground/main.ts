import './main.css'
import { Pane } from 'tweakpane'
import { TreeView } from '../src/main'
import { TreeViewItem } from '../src/item'

const treeview = new TreeView()
treeview.dom.classList.add('sticky', 'top-0')
treeview.resizable = 'bottom'
treeview.resizeMax = Infinity
treeview.dom.style.height = '300px'
document.body.append(treeview.domElement)

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

const setCssVar = ({ presetKey, value }) => {
  document.documentElement.style.setProperty(presetKey, value)
}

const params = {
  '--color-resize-handle': cssVar('--color-resize-handle') || '#dddddd',
  '--color-bg': cssVar('--color-bg') || '#28292E',
}

const pane = new Pane()
pane.element.style.width = '350px'
pane.element.style.transform = 'translateX(-100px)'
pane.addInput(params, '--color-resize-handle').on('change', setCssVar)
pane.addInput(params, '--color-bg').on('change', setCssVar)
