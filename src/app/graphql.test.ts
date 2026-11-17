import { Kind, visit } from 'graphql'
import type { DocumentNode } from 'graphql'

const documents = import.meta.glob<DocumentNode>('../**/*.gql', {
  eager: true,
  import: 'default',
})

test.each(Object.entries(documents))('%s loads with all referenced fragments', (_, document) => {
  expect(document.kind).toBe(Kind.DOCUMENT)
  expect(document.definitions.length).toBeGreaterThan(0)

  const fragments = new Set(document.definitions.flatMap(definition =>
    definition.kind === Kind.FRAGMENT_DEFINITION ? [definition.name.value] : []
  ))
  visit(document, {
    FragmentSpread(node) {
      expect(fragments.has(node.name.value)).toBe(true)
    },
  })
})
