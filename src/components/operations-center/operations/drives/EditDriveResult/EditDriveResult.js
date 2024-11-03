import React from 'react';
import EditResults from '../../../../common/EditResult/EditResults';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';
const EditDriveResult = () => {
  return (
    <EditResults operationable_type={PolymorphicType.OC_OPERATIONS_DRIVES} />
  );
};

export default EditDriveResult;
