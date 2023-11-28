import { onDestroy } from 'svelte'
import { derived, get, writable, type Writable } from 'svelte/store'
import type { FolderApi, TabPageApi } from 'tweakpane'
import { Pane } from 'tweakpane'
import type { PaneConfig } from 'tweakpane/dist/types/pane/pane-config'

export const useTweakpane = (config?: Omit<PaneConfig, 'container' | 'document'>) => {
	if (typeof window === 'undefined') {
		return {
			addFolder() {},
			addSeparator() {},
			addButton() {},
			addInput<Value>() {
				return writable<Value>()
			},
			action() {},
			pane: undefined,
		}
	}

	let disposed = false

	const pane = new Pane(config) as Pane
	const unsubscriptions = new Set<() => void>()

	const action = (node: HTMLElement) => {
		node.append(pane.element)

		// THIS IS TO ENSURE THAT CSS IS HANDLED EQUALLY
		// IN A PLAYGROUND AND IN A REGULAR EXAMPLE
		node.style.top = '1.5rem'
		node.style.right = '1.5rem'
		node.style.width = 'calc(100% - 3rem)'
		node.style.maxWidth = '400px'
		node.style.position = 'absolute'
		node.style.zIndex = '1'
		node.style.setProperty('--tp-base-background-color', 'hsla(230, 0%, 90%, 1.00')
		node.style.setProperty('--tp-base-shadow-color', 'hsla(0, 0%, 0%, 0.0')
		node.style.setProperty('--tp-button-background-color', 'hsla(230, 0%, 75%, 1.00')
		node.style.setProperty('--tp-button-background-color-active', 'hsla(230, 0%, 60%, 1.00')
		node.style.setProperty('--tp-button-background-color-focus', 'hsla(230, 0%, 65%, 1.00')
		node.style.setProperty('--tp-button-background-color-hover', 'hsla(230, 0%, 70%, 1.00')
		node.style.setProperty('--tp-button-foreground-color', 'hsla(230, 10%, 0%, 1.00')
		node.style.setProperty('--tp-container-background-color', 'hsla(230, 0%, 30%, 0.20')
		node.style.setProperty('--tp-container-background-color-active', 'hsla(230, 0%, 30%, 0.32')
		node.style.setProperty('--tp-container-background-color-focus', 'hsla(230, 0%, 30%, 0.28')
		node.style.setProperty('--tp-container-background-color-hover', 'hsla(230, 0%, 30%, 0.24')
		node.style.setProperty('--tp-container-foreground-color', 'hsla(230, 0%, 30%, 1.00')
		node.style.setProperty('--tp-groove-foreground-color', 'hsla(230, 0%, 30%, 0.10')
		node.style.setProperty('--tp-input-background-color', 'hsla(230, 0%, 30%, 0.10')
		node.style.setProperty('--tp-input-background-color-active', 'hsla(230, 0%, 30%, 0.22')
		node.style.setProperty('--tp-input-background-color-focus', 'hsla(230, 0%, 30%, 0.18')
		node.style.setProperty('--tp-input-background-color-hover', 'hsla(230, 0%, 30%, 0.14')
		node.style.setProperty('--tp-input-foreground-color', 'hsla(230, 0%, 30%, 1.00')
		node.style.setProperty('--tp-label-foreground-color', 'hsla(230, 0%, 30%, 0.70')
		node.style.setProperty('--tp-monitor-background-color', 'hsla(230, 0%, 30%, 0.10')
		node.style.setProperty('--tp-monitor-foreground-color', 'hsla(230, 0%, 30%, 1')

		return {
			destroy() {
				if (disposed) return
				pane.dispose()
				for (const unsubscribe of unsubscriptions) unsubscribe()
				disposed = true
			},
		}
	}

	const addButton = (options: {
		title: string
		label?: string
		onClick: () => void
		parent?: FolderApi | TabPageApi
	}) => {
		const button = (options.parent ?? pane).addButton({
			title: options.title,
			label: options.label ?? options.title,
		})
		button.on('click', options.onClick)
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
	const addInput = <Value>(options: {
		label: string
		value: Value
		params?: unknown
		parent?: FolderApi | TabPageApi
	}): Writable<Value> => {
		const inputStore = writable({
			updatedAt: Date.now(),
			value: options.value,
		})

		const userStore = writable({
			updatedAt: Date.now(),
			value: options.value,
		})

		const store = writable<Value>(options.value)
		const binding = (options.parent ?? pane).addBinding(
			{
				[options.label]: get(store),
			},
			options.label,
			options.params,
		)

		binding.on('change', (event: { value: Value }) => {
			inputStore.set({
				updatedAt: Date.now(),
				value: event.value,
			})
		})

		unsubscriptions.add(
			userStore.subscribe((v) => {
				binding.controller.value.binding.target.write(v.value)
				binding.refresh()
			}),
		)

		const value = derived([inputStore, userStore], ([inputStore, userStore]) => {
			if (inputStore.updatedAt > userStore.updatedAt) {
				return inputStore.value
			}
			return userStore.value
		})

		return {
			subscribe: value.subscribe,
			set: (value: Value) => userStore.set({ updatedAt: Date.now(), value }),
			update: (callback: (value: Value) => Value) =>
				userStore.update((v) => ({ updatedAt: Date.now(), value: callback(v.value) })),
		} as Writable<Value>
	}

	onDestroy(() => {
		if (disposed) return
		pane.dispose()
		for (const unsub of unsubscriptions) unsub()
		disposed = true
	})

	return {
		addButton,
		addInput,
		action,
		pane,
	}
}
