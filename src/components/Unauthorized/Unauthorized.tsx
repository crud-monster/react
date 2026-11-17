import React from 'react'
import Alert from '../ui/Alert'

interface UnauthorizedProps { where?: string }
function Unauthorized({ where = '' }: UnauthorizedProps) {
  return <div className="page"><Alert variant="danger">Unauthorized {where} access.</Alert></div>
}
export default Unauthorized
