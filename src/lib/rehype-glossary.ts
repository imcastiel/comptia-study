import { GLOSSARY } from './glossary'

type HastNode = {
  type: string
  tagName?: string
  value?: string
  children?: HastNode[]
  properties?: Record<string, unknown>
}

const SKIP_TAGS = new Set(['code', 'pre', 'a', 'abbr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

// Build regex once — sort longest terms first so "MU-MIMO" matches before "MIMO"
const sortedTerms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
const escaped = sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
const TERM_REGEX = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g')

function processText(text: string): HastNode[] {
  const nodes: HastNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  TERM_REGEX.lastIndex = 0
  while ((match = TERM_REGEX.exec(text)) !== null) {
    const term = match[1]
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    nodes.push({
      type: 'element',
      tagName: 'abbr',
      properties: { 'data-def': GLOSSARY[term] },
      children: [{ type: 'text', value: term }],
    })
    lastIndex = TERM_REGEX.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', value: text }]
}

function walk(node: HastNode): void {
  if ((node.type !== 'element' && node.type !== 'root') || !node.children) return
  if (node.type === 'element' && SKIP_TAGS.has(node.tagName ?? '')) return

  const newChildren: HastNode[] = []
  for (const child of node.children) {
    if (child.type === 'text' && child.value) {
      newChildren.push(...processText(child.value))
    } else {
      walk(child)
      newChildren.push(child)
    }
  }
  node.children = newChildren
}

export function rehypeGlossary() {
  return (tree: HastNode) => {
    walk(tree)
  }
}
