import React from 'react';
import EditResults from '../../../../common/EditResult/EditResults';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';
const EditSessionResult = () => {
  return (
    <EditResults operationable_type={PolymorphicType.OC_OPERATIONS_SESSIONS} />
  );
};

export default EditSessionResult;
