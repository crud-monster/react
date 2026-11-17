import { ApolloLink, Observable } from '@apollo/client'
import { sessionRevision } from './storage'

export function createSessionGuard() {
  return new ApolloLink((operation, forward) => new Observable(observer => {
    const revision = operation.getContext().sessionRevision ?? sessionRevision()
    const changed = () => sessionRevision() !== revision
    const stale = () => new Error('Session changed while request was pending')
    if (changed()) { observer.error(stale()); return }
    const subscription = forward(operation).subscribe({
      next: result => { if (changed()) observer.error(stale()); else observer.next(result) },
      error: error => observer.error(changed() ? stale() : error),
      complete: () => observer.complete(),
    })
    return () => subscription.unsubscribe()
  }))
}
