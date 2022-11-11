import './main.css'
import TreeView from '../src/main.ts'
import TreeViewItem from '../src/item.ts'

const treeview = new TreeView()
treeview.dom.classList.add('sticky', 'top-0')
treeview.resizable = 'bottom'
treeview.resizeMax = Infinity
treeview.dom.style.height = '300px'
document.querySelector('#app')!.append(treeview.domElement)

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