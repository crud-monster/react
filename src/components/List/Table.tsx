import { useMutation, useQuery } from '@apollo/client/react';
import { DocumentNode } from 'graphql'
import React, { useState } from 'react'
import { Table as BTable } from 'react-bootstrap'
import DeleteModal from '../DeleteModal/DeleteModal'
import Loading from '../Loading/Loading'
import Unauthorized from '../Unauthorized/Unauthorized'
import { IListRowParams, ListRow } from './Row'
import { IFilteredField } from './RowItem'


export interface IFilterWithParams {
  filter?: string
  params?: string
}

export interface ITableQueries {
  ADMIN_LIST_QUERY: DocumentNode
  USER_LIST_QUERY: DocumentNode
  DELETE_MUTATION: DocumentNode
}

export interface TableProps {
  userId?: string
  adminMode?: boolean
  filter: any
  queries: ITableQueries
  fields?: IFilteredField[]
  name: string
  onEdit: IListRowParams['onEdit']
  getEditLink?: IListRowParams['getEditLink']
}

export type ITableList = TableProps

function Table({ filter, name, adminMode = false, queries, fields, onEdit, getEditLink }: TableProps) {
  const [unauthorized, setUnauthorized] = useState(false)
  const [deleteObject, setDeleteObject] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingOnDeleteDialog, setDeletingOnDeleteDialog] = useState(false)

  const [error, setError] = useState<Error>()

  const { refetch: userRefetch, loading, data: result, error: queryError } = useQuery<Record<string, any[]>>(
    adminMode ? queries.ADMIN_LIST_QUERY : queries.USER_LIST_QUERY,
    { variables: { filter } },
  )
  const data = result ? Object.values(result)[0] || [] : []


  const [deleteProjectMutation] = useMutation(queries.DELETE_MUTATION, {
    errorPolicy: 'none',
    onCompleted: (data: any) => {
      onHideDidaloDelete()
      userRefetch()
    },
    onError: (e) => {
      setDeletingOnDeleteDialog(false)
      setError(e)
      if (e.message === 'GraphQL error: Unauhorized') {
        setUnauthorized(true)
      }
    },
  })

  const onHideDidaloDelete = () => {
    setShowDeleteDialog(false)
    setDeleteObject(null)
  }

  const onDelete = (obj: any) => {
    setDeletingOnDeleteDialog(false)
    setShowDeleteDialog(true)
    setDeleteObject(obj)
  }

  const doDelete = (deleteObject: any) => {
    setDeletingOnDeleteDialog(true)
    deleteProjectMutation({
      variables: {
        id: deleteObject.id,
      },
    })
  }

  if (unauthorized || (queryError && /unau?thorized|unauhorized/i.test(queryError.message))) {
    return <Unauthorized where={name} />
  }
  if (loading) return <Loading what={name} />

  return (
    <div>
      {(error || queryError) && <div role="alert">{`Error! ${(error || queryError)?.message}`}</div>}

      <BTable responsive>
        <thead>
          <tr>
            <th>Id</th>
            {fields?.map((f) => f !== 'id' && <th>{(f as any).name ? (f as any).name : f}</th>)}
            {adminMode && <th>User</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.length &&
            data.map((projectItem: any) => (
              <ListRow name={name} item={projectItem} onDelete={onDelete} fields={fields} showDelete={adminMode} onEdit={onEdit} getEditLink={getEditLink} />
            ))}
        </tbody>
      </BTable>

      <DeleteModal
        show={showDeleteDialog}
        onHide={onHideDidaloDelete}
        onDelete={doDelete}
        modelName={name}
        deleteObject={deleteObject}
        deleting={deletingOnDeleteDialog}
      />
    </div>
  )
}

export default Table
