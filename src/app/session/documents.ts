import { visit } from 'graphql'
import type { DocumentNode } from 'graphql'
import { usesHttpOnlySession } from './config'

// Call only for authentication operations. Cookie refresh credentials must not be requested as JSON.
export function sessionDocument(document: DocumentNode): DocumentNode {
  if (!usesHttpOnlySession()) return document
  return visit(document, { Field(node) { if (node.name.value === 'refreshToken') return null } })
}
