import React from 'react'
import Dialog from '../ui/Dialog'
import Button from '../ui/Button'

interface DeleteModalProps {
  show: boolean
  onHide: () => void
  onDelete: (item: { id?: string; name?: string }) => void
  modelName: string
  deleteObject?: { id?: string; name?: string } | null
  deleting?: boolean
}

export type IDeleteModalParams = DeleteModalProps

function DeleteModal({ show, onHide, onDelete, modelName, deleteObject, deleting }: DeleteModalProps) {
  return <Dialog open={show} title={`Delete ${deleteObject?.name || modelName}`} onClose={onHide} busy={deleting}>
    <p className="text-sm text-slate-600">{deleting ? 'Deleting' : 'Are you sure you want to delete'} {modelName} {deleteObject?.name || deleteObject?.id}? This action cannot be undone.</p>
    <div className="mt-6 flex justify-end gap-3">
      <Button variant="secondary" disabled={deleting} onClick={onHide} data-autofocus>Cancel</Button>
      <Button variant="danger" disabled={deleting || !deleteObject} onClick={() => { if (deleteObject && !deleting) onDelete(deleteObject) }}>{deleting ? 'Deleting…' : 'Delete'}</Button>
    </div>
  </Dialog>
}

export default DeleteModal
