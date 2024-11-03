import React from 'react';
import SelectDropdown from '../../../../../../common/selectDropdown';

const NoteTableFiltersDynamicForm = ({
  setFilterFormData,
  filterFormData,
  categories,
  subCategories,
}) => {
  const handleSelectChange = (data, name) => {
    const dataValue = data ? data.value : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
      <SelectDropdown
        styles={{ root: 'w-100' }}
        placeholder={'Note Category'}
        removeDivider
        onChange={(data) => handleSelectChange(data, 'category_id')}
        options={categories}
      />
      {filterFormData?.category_id && (
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder={'Note Subcategory'}
          removeDivider
          onChange={(data) => handleSelectChange(data, 'subcategory_id')}
          options={subCategories}
        />
      )}
    </div>
  );
};

export default NoteTableFiltersDynamicForm;
