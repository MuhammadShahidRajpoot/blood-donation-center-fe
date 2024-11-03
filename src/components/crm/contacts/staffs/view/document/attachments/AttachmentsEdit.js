import React from 'react';
import { useParams } from 'react-router';
import { API } from '../../../../../../../api/api-routes';
import EditAttachments from '../../../../../../common/DocumentComponent/Attachments/EditAttachments';
import TopBar from '../../../../../../common/topbar/index';
import { StaffBreadCrumbsData } from '../../../StaffBreadCrumbsData';
import PolymorphicType from '../../../../../../../enums/PolymorphicTypeEnum';

export default function AttachmentsEdit() {
  const { id, attachId } = useParams();
  const BreadcrumbsData = [
    ...StaffBreadCrumbsData,
    {
      label: 'View Staff',
      class: 'disable-label',
      link: `/crm/contacts/staff/${id}/view`,
    },
    {
      label: 'Documents',
      class: 'disable-label',
      link: `/crm/contacts/staff/${id}/view/documents/notes`,
    },
    {
      label: 'Attachments',
      class: 'disable-label',
      link: `/crm/contacts/staff/${id}/view/documents/attachments`,
    },
    {
      label: 'Edit Attachment',
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
      <EditAttachments
        type={PolymorphicType.CRM_CONTACTS_STAFF}
        attachId={attachId}
        editApi={API.crm.documents.attachments.updateAttachment}
        categoryApi={API.systemConfiguration.crmAdministration.contact.attachmentCategories.getAll()}
        subCategoryApi={API.systemConfiguration.crmAdministration.contact.attachmentSubcategories.getAll()}
        listLink={`/crm/contacts/staff/${id}/view/documents/attachments`}
        archiveApi={API.crm.documents.attachments.archiveAttachment}
      />
    </div>
  );
}
