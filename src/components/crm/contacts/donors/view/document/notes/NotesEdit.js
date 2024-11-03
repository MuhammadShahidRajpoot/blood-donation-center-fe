import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useParams } from 'react-router-dom';
import { API } from '../../../../../../../api/api-routes.js';
import EditNotes from '../../../../../../common/DocumentComponent/Notes/EditNotes.js';
import TopBar from '../../../../../../common/topbar/index.js';
import { DonorBreadCrumbsData } from '../../../../donor/DonorBreadCrumbsData.js';
import PolymorphicType from '../../../../../../../enums/PolymorphicTypeEnum.js';

const NotesEdit = () => {
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
      label: 'Notes',
      class: 'disable-label',
      link: `/crm/contacts/donor/${id}/view/documents/notes`,
    },
    {
      label: 'Edit Note',
      class: 'active-label',
      link: `#`,
    },
  ];
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  useEffect(() => {
    getCategory();
    getsubCategory();
  }, []);
  const getCategory = async () => {
    try {
      const response =
        await API.systemConfiguration.crmAdministration.contact.noteCategories.getAll();
      if (response?.data) {
        const category = response?.data?.data;
        setCategories(category);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const getsubCategory = async () => {
    try {
      const response =
        await API.systemConfiguration.crmAdministration.contact.noteSubcategories.getAll();
      if (response?.data) {
        const category = response?.data?.data;
        setSubCategories(category);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Notes'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />
      <EditNotes
        noteable_type={PolymorphicType.CRM_CONTACTS_DONORS}
        notesListPath={`/crm/contacts/donor/${id}/view/documents/notes`}
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
};

export default NotesEdit;
