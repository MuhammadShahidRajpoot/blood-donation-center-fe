import React from 'react';
import ListTask from '../../../common/tasks/ListTask';
import { ACCOUNT_TASKS_PATH } from '../../../../routes/path';
import { useParams } from 'react-router-dom';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const AccountListTasks = ({ setSearchText, searchText }) => {
  const params = useParams();

  return (
    <ListTask
      taskableType={PolymorphicType.CRM_ACCOUNTS}
      taskableId={params?.account_id}
      createTaskUrl={ACCOUNT_TASKS_PATH.CREATE.replace(
        ':account_id',
        params?.account_id
      )}
      searchText={searchText}
      setSearchText={setSearchText}
      hideToBar={true}
    />
  );
};

export default AccountListTasks;
