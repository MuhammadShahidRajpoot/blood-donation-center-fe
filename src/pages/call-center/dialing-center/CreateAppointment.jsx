import React from 'react';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage.jsx';
import Layout from '../../../components/common/layout/index.js';
import DonorCreateFormSchedule from '../../../components/crm/contacts/donors/schedule/DonorCreateFormSchedule.js';
import { useParams } from 'react-router-dom';

const CreateAppointment = () => {
  const { id, donationType } = useParams();
  // const hasPermission = CheckPermission([
  //   CallCenterPermissions.CALLCENTER.DIALING_CENTER.READ,
  // ]);
  const hasPermission = true;
  if (hasPermission) {
    return (
      <Layout>
        {<DonorCreateFormSchedule donorId={id} donationType={donationType} />}
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};
export default CreateAppointment;
