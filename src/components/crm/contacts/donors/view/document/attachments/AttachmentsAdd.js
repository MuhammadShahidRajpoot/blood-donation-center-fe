import React from 'react';
import { useParams } from 'react-router';
import { API } from '../../../../../../../api/api-routes';
import CreateAttachments from '../../../../../../common/DocumentComponent/Attachments/CreateAttachments';
import TopBar from '../../../../../../common/topbar/index';
import { DonorBreadCrumbsData } from '../../../../donor/DonorBreadCrumbsData';
import PolymorphicType from '../../../../../../../enums/PolymorphicTypeEnum';

export default function AttachmentsAdd() {
  const { donorId: id } = useParams();

  const BreadcrumbsData = [
    ...DonorBreadCrumbsData,
    {
      label: 'View Donors',
      class: 'disable-label',
      link: `/crm/contacts/donor/${id}/view`,
    },
    {
      label: 'Documents',
      class: 'disable-label',
      link: `/crm/contacts/donor/${id}/view/documents/notes`,
    },
    {
      label: 'Attachments',
      class: 'disable-label',
      link: `/crm/contacts/donor/${id}/view/documents/attachments`,
    },
    {
      label: 'Add Attachment',
      class: 'active-label',
      link: `#`,
    },
  ];
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Attachments'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />
      <CreateAttachments
        type={PolymorphicType.CRM_CONTACTS_DONORS}
        submitApi={API.crm.documents.attachments.createAttachment}
        categoryApi={API.systemConfiguration.crmAdministration.contact.attachmentCategories.getAll()}
        subCategoryApi={API.systemConfiguration.crmAdministration.contact.attachmentSubcategories.getAll()}
        listLink={`/crm/contacts/donor/${id}/view/documents/attachments`}
      />
    </div>
  );
}
