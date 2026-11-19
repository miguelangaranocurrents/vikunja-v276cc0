import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

/**
 * Serializes a copied slice as plain text. Lists keep their markers ("- " for bullets,
 * "1. " for ordered lists) so copying a list yields text that still reads as a list.
 */
export function serializeClipboardText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => lines.push(...blockLines(node)))
	return lines.join('\n')
}

function blockLines(node: ProseMirrorNode): string[] {
	if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
		const ordered = node.type.name === 'orderedList'
		const start = Number(node.attrs.start ?? 1)
		const lines: string[] = []
		node.forEach((item, _offset, index) => {
			const marker = ordered ? `${start + index}. ` : '- '
			const itemLines: string[] = []
			item.forEach(child => itemLines.push(...blockLines(child)))
			itemLines.forEach((line, lineIndex) => {
				lines.push((lineIndex === 0 ? marker : ' '.repeat(marker.length)) + line)
			})
		})
		return lines
	}

	if (node.isTextblock) {
		return [node.textBetween(0, node.content.size, '\n')]
	}

	if (node.isLeaf) {
		return []
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...blockLines(child)))
	return lines
}
