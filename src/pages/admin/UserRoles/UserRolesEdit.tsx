import React from "react";
import Button from "../../../components/ui/Button";
import { useForm } from 'react-hook-form';
import { useParams } from "react-router-dom";
import Control from "../../../components/Editor/Control";
import Editor from "../../../components/Editor/Editor";

import CREATE_MUTATION from './graphql/mutation-create-user-role.gql';
import UPDATE_MUTATION from './graphql/mutation-update-user-role.gql';
import QUERY from './graphql/query-user-role.gql';

const UserRoleForm = ({ storedData, onSubmit, userRoleId, graphQlError }: any) => {
  const reactForm = useForm()
  const { handleSubmit } = reactForm
  return (<form className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
    <Control name={'name'} label={'Role name'} required={true} storedData={storedData} {...reactForm} />
    <Button type="submit">Save</Button>
  </form>)
}

export const UserRoleEdit = (data: any) => {
  const { id } = useParams() as { id: string }

  return (
    <>
      <Editor
        id={id}
        name={'UserRole'}
        fields={['role']}
        query={{
          CREATE_MUTATION,
          UPDATE_MUTATION,
          QUERY
        }}
      >
        {(storedData: any, onSubmit: any, errors: any) => <UserRoleForm storedData={storedData} onSubmit={onSubmit} graphQlError={errors} userRoleId={id} />}
      </Editor>
    </>
  );
};

export default UserRoleEdit