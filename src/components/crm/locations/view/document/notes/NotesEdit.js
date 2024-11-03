import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../../../../../../api/api-routes';
import EditNotes from '../../../../../common/DocumentComponent/Notes/EditNotes.js';
import TopBar from '../../../../../common/topbar/index';
import { LocationsBreadCrumbsData } from '../../../LocationsBreadCrumbsData';
import PolymorphicType from '../../../../../../enums/PolymorphicTypeEnum.js';

const NotesEdit = () => {
  const { id } = useParams();
  const BreadcrumbsData = [
    ...LocationsBreadCrumbsData,
    {
      label: 'View Location',
      class: 'disable-label',
      link: `/crm/locations/${id}/view`,
    },
    {
      label: 'Documents',
      class: 'disable-label',
      link: `/crm/locations/${id}/view/documents/notes`,
    },
    {
      label: 'Notes',
      class: 'disable-label',
      link: `/crm/locations/${id}/view/documents/notes`,
    },
    {
      label: 'Edit Note',
      class: 'active-label',
      link: '#',
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
        await API.systemConfiguration.crmAdministration.location.noteCategories.getAll();
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
        await API.systemConfiguration.crmAdministration.location.noteSubcategories.getAll();
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
        noteable_type={PolymorphicType.CRM_LOCATIONS}
        notesListPath={`/crm/locations/${id}/view/documents/notes`}
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
};

export default NotesEdit;
