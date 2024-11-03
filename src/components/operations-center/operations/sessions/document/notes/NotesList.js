import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../../../../../../api/api-routes';
import LocationNotes from '../../../../../../assets/images/LocationNotes.png';
import ListNotes from '../../../../../common/DocumentComponent/Notes/ListNotes.js';
import TopBar from '../../../../../common/topbar/index';

import './index.scss';
import SessionsNavigationTabs from '../../navigationTabs';
import PolymorphicType from '../../../../../../enums/PolymorphicTypeEnum.js';

export default function NotesList() {
  const [search, setSearch] = useState('');
  const { id } = useParams();
  const BreadcrumbsData = [
    { label: 'Operations Center', class: 'disable-label', link: '/' },
    {
      label: 'Operations',
      class: 'disable-label',
      link: `/operations-center/operations/sessions`,
    },
    {
      label: 'Sessions',
      class: 'disable-label',
      link: `/operations-center/operations/sessions`,
    },
    {
      label: 'View Session',
      class: 'disable-label',
      link: `/operations-center/operations/sessions/${id}/view/about`,
    },
    {
      label: 'Documents',
      class: 'disable-label',
      link: `/operations-center/operations/sessions/${id}/view/documents/notes`,
    },
    {
      label: 'Notes',
      class: 'active-label',
      link: `/operations-center/operations/sessions/${id}/view/documents/notes`,
    },
  ];

  const searchFieldChange = (e) => {
    setSearch(e.target.value);
  };
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  useEffect(() => {
    getCategory();
    getsubCategory();
  }, []);
  const getCategory = async () => {
    try {
      const response =
        await API.systemConfiguration.operationAdministrations.notesAttachment.noteCategories.getAll();
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
        await API.systemConfiguration.operationAdministrations.notesAttachment.noteSubcategories.getAll();
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
        SearchValue={search}
        SearchOnChange={searchFieldChange}
        SearchPlaceholder={'Search'}
      />
      <div className="imageContentMain">
        <div className="imageHeading">
          <div className="Image">
            <img src={LocationNotes} alt="CancelIcon" />
          </div>

          <div className="d-flex flex-column">
            <h4 className="">Metro High School</h4>
            <span>Gymnasium</span>
          </div>
        </div>
        <div className="tabsnLink">
          <SessionsNavigationTabs />
        </div>
      </div>
      <ListNotes
        search={search}
        notesListPath={`/operations-center/operations/sessions/${id}/view/documents/notes`}
        attachmentsListPath={`/operations-center/operations/sessions/${id}/view/documents/attachments`}
        addNotesLink={`/operations-center/operations/sessions/${id}/view/documents/notes/create`}
        noteable_type={PolymorphicType.OC_OPERATIONS_SESSIONS}
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
}
