import './main.css'
import { Pane, type TpChangeEvent } from 'tweakpane'
import { TreeViewWebComponent, TreeViewItem } from '../src/main'

const treeview = new TreeViewWebComponent()
treeview.dom.classList.add('sticky', 'top-0')
treeview.scrollable = true
treeview.allowRenaming = true

document.body.append(treeview.wc)

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

const style = document.createElement('style')
document.head.append(style)

const computedStyle = getComputedStyle(document.querySelector('style')!)

const cssVar = (name: string) => {
  return computedStyle.getPropertyValue(name)
}

const list = [
  '--font-family',
  '--bg-darkest',
  '--bg-darker',
  '--bg-dark',
  '--bg-primary',
  '--color-line',
  '--color-icon',
  '--text-darkest',
  '--text-dark',
  '--text-secondary',
  '--text-primary',
  '--text-active',
  '--error',
  '--error-secondary',
  '--border-primary',
  '--element-shadow-hover',
  '--element-shadow-active',
  '--element-shadow-error',
  '--element-color-placeholder',

  '--field-padding',
  '--disabled-opacity',
  '--element-margin',
  '--element-opacity-disabled',
  '--element-opacity-readonly',
]

const params = {}

const setCssVar = ({ presetKey, value }: TpChangeEvent<string>) => {
  console.log(presetKey, value)

  let innerHTML = ':root {'

  for (const item of list) {
    innerHTML += `${item}: ${params[item]} !important;`
  }

  innerHTML += '}'

  style.innerHTML = innerHTML
}

const pane = new Pane()
pane.element.style.width = '350px'
pane.element.style.transform = 'translateX(-100px)'

for (const item of list) {
  params[item] = cssVar(item)
  pane.addInput(params, item).on('change', setCssVar)
}
