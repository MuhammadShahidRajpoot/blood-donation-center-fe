import React, { useEffect, useState } from 'react';
import { makeAuthorizedApiRequest } from '../../../../../../../helpers/Api';
import { toast } from 'react-toastify';
import NoteTableFiltersDynamicForm from './DynamicForm';

function NoteTableFilters({
  setIsLoading,
  setSelectedOptions,
  selectedOptions,
  categories,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [filterFormData, setFilterFormData] = useState();
  const [subCategories, setSubCategories] = useState();

  const getSubCategories = async (category_id) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/notes/sub-categories/${category_id}`
    );
    const data = await result.json();
    if (result.ok || result.status === 200) {
      setSubCategories(
        data?.data?.map((item) => {
          return { value: item.id, label: item.name };
        }) || []
      );
    } else {
      toast.error('Error Fetching Note SubCategories', { autoClose: 3000 });
    }
  };

  const reinitializeState = () => {
    const dynamicProperties = {};
    for (const key in filterFormData) {
      dynamicProperties[key] = '';
    }
    setFilterFormData(dynamicProperties);
  };

  useEffect(() => {
    reinitializeState();
    if (!selectedOptions?.category_id) return;
    setIsLoading(true);
  }, [selectedOptions]);

  const handleDataChange = (updatedData) => {
    if (updatedData.category_id) {
      getSubCategories(updatedData.category_id);
      setSelectedOptions(updatedData);
    } else {
      // if field was cleared, set selected options to 0
      setSelectedOptions({});
    }
    setFilterFormData(updatedData);
    // fetchAllFilters(currentPage, limit, updatedData);
  };

  return (
    <NoteTableFiltersDynamicForm
      categories={categories}
      subCategories={subCategories}
      filterFormData={selectedOptions}
      setFilterFormData={handleDataChange}
    />
  );
}

export default NoteTableFilters;
