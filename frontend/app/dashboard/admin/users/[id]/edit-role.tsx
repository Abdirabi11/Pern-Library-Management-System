import { updateRoleSchema } from '@/lib/schemas/admin.schema'
import React from 'react'

const editRole = () => {
    useAdminUpdateRoleMutation(updateRoleSchema){
        
    }
  return (
    <div>edit-role</div>
  )
}

export default editRole