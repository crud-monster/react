import type { DocumentNode } from 'graphql'
import { useMutation, useQuery } from '@apollo/client/react';
import React, { useCallback, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import Unauthorized from '../Unauthorized/Unauthorized'

export const getDataFromRaw = (rawData: any) => {
  const rawName = Object.keys(rawData)[0]
  return rawData[rawName]
}

interface EditorProps {
  name: string
  id?: string
  fields?: string[]
  form?: unknown
  renameError?: (error: string) => string
  onUpdated?: (data: Record<string, unknown>) => void
  updateCache?: useMutation.Options<Record<string, unknown>>['update']
  query: { QUERY: DocumentNode; CREATE_MUTATION: DocumentNode; UPDATE_MUTATION: DocumentNode }
  children: (data: Record<string, unknown>, submit: (data: Record<string, unknown>) => void, errors: string[] | null) => React.ReactNode
}

function Editor({ name, id, renameError, onUpdated, updateCache, query, children }: EditorProps) {
  const [localId, setLocalId] = useState(id !== 'create' ? id : undefined)
  const [unauthorized, setUnauthorized] = useState(false)
  const [errors, setErrors] = useState<string[] | null>([])

  const [storedData, setStoredData] = useState({})

  const handleError = (incommingError: { message: string }) => {
    let incomingErrors = incommingError.message.split('\n')
    if (renameError) {
      incomingErrors = incomingErrors.map((error) => renameError(error))
    }
    setErrors(incomingErrors)
  }

  const onCompleted = (raw: any) => {
    const data = getDataFromRaw(raw)
    setLocalId(data.id)
    setErrors(null)
    if (onUpdated) onUpdated(raw)
  }

  const skipLoading = !localId
  const { loading, data: loadedDataRaw, error: loadError } = useQuery<Record<string, unknown>>(query.QUERY, {
    variables: { id: localId },
    skip: skipLoading,
  })
  useEffect(() => {
    if (!loadedDataRaw) return
    const loadedData = getDataFromRaw(loadedDataRaw)
    if (loadedData) setStoredData({ ...loadedData })
    else setUnauthorized(true)
  }, [loadedDataRaw])
  useEffect(() => {
    if (loadError) {
      if (/unau?thorized|unauhorized/i.test(loadError.message)) setUnauthorized(true)
      else setErrors([loadError.message])
    }
  }, [loadError])

  const [createProjectMutation] = useMutation<Record<string, unknown>>(query.CREATE_MUTATION, {
    errorPolicy: 'none',
    onCompleted: onCompleted,
    update: updateCache,
    onError: handleError,
  })

  const [updateProjectMutation] = useMutation<Record<string, unknown>>(query.UPDATE_MUTATION, {
    errorPolicy: 'none',
    onCompleted: onCompleted,
    update: updateCache,
    onError: handleError,
  })

  // const onSubmit = (data:any) => {
  //   console.log(data)
  // }

  const onSubmit = useCallback(
    (data: Record<string, unknown>) => {
      if (localId) {
        setErrors(null)
        updateProjectMutation({
          variables: {
            id: localId,
            ...data,
          },
        })
      } else {
        createProjectMutation({
          variables: {
            userId: localStorage.getItem('user.id'),
            ...data,
          },
        })
      }
    },
    [localId, createProjectMutation, updateProjectMutation],
  )

  if (unauthorized) {
    return <Unauthorized where={`${name} edit`} />
  }

  if (loading) {
    return <Loading what={name} />
  }

  return <div>{children(storedData, onSubmit, errors)}</div>
}

export default Editor
