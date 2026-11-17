import { useMutation, useQuery } from '@apollo/client/react';
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";

interface ConnectBaseProps {
  value: any
  names?: string[]
  gql: any
  item: any
}

function ConnectBase({ value, names = [], gql, item }: ConnectBaseProps) {
  const element = value
  const name = names[1] || 'name'
  const elementTitle = element.push && element.reduce && names.length > 1 ? (element as any[]).reduce((p, e) => p + `, ${e[name]}`, '').substr(2) : element

  const [title, setTitle] = useState(elementTitle)
  const [data, setData] = useState<any[]>([])

  const { data: queryData } = useQuery<Record<string, any[]>>(gql.QUERY)
  useEffect(() => {
    const raw = queryData && Object.values(queryData)[0]
    setData((raw || []).map((r: any) => ({
      id: r.id,
      checked: String(elementTitle).includes(String(r[name])),
      label: r[name],
    })))
  }, [queryData, elementTitle, name])


  const [addMutation] = useMutation(gql.ADD, { errorPolicy: "none" })

  const [removeMutation] = useMutation(gql.REMOVE, { errorPolicy: "none" })

  const onChecked = (value: any) => {
    const updated = data.map((d: any) => {
      if (d.label === value.label) {
        d.checked = !d.checked
      }
      return { ...d }
    })

    const updateTitle = (updated as any[]).reduce((p, e) => {
      if (e.checked) return `${p}, ${e.label}`
      else return p
    }, '').substr(1)

    if (value.checked) {
      addMutation({
        variables: {
          id1: value.id,
          id2: item.id
        }
      });
    } else {
      removeMutation({
        variables: {
          id1: value.id,
          id2: item.id
        }
      });
    }


    setData(updated)
    setTitle(updateTitle)
  }

  // if(element.push && element.reduce && names.length > 1) {
  //   return (<>ahoj: {(element as any[]).reduce((p, e)=>p + e[names[1]], '')}</>)
  // }

  return (<DropdownButton id="dropdown-basic-button" title={title}>
    {data && data.map((d: any) => (
      <Dropdown.Item onClick={(e: any) => onChecked(d)} >
        <Form.Check
          type="checkbox"
          label={d.label}
          checked={d.checked} />
      </Dropdown.Item>))
    }
  </DropdownButton>)
}

export default ConnectBase