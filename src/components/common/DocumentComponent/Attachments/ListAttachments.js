/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import './index.scss';
import TableList from '../../tableListing';
import Pagination from '../../pagination';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../successModal';
import { API } from '../../../../api/api-routes';
import SelectDropdown from '../../selectDropdown';
import SvgComponent from '../../SvgComponent';

export default function ListAttachments({
  type,
  createApi,
  attachmentApi,
  notesApi,
  viewEditApi,
  archiveApi,
  listApi,
  subCategoryApi,
  categoryApi,
  search,
}) {
  const params = useParams();
  const id =
    type == 'donors'
      ? params?.donorId
      : params.account_id || params.volunteerId || params?.id;
  const [attachmentsSubCategoryList, setAttachmentsSubCategoryList] =
    useState();
  const [category, setCategory] = useState('');
  const [categoryText, setCategoryText] = useState('Category');
  const [isLoading, setIsLoading] = useState(true);
  const [subCategory, setSubcategory] = useState('');
  const [subCategoryText, setSubcategoryText] = useState('Subcategory');
  const [showModel, setShowModel] = useState(false);
  const [archiveid, setArchiveId] = useState(0);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT && 5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [category_id, setCategoryId] = useState();
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [sub_category_id, setSubCategoryId] = useState();
  const [status, setStatus] = useState();
  const [categoryOption, setCategoryOption] = useState([
    {
      statusText: categoryText,
      options: [],
    },
  ]);
  const [subCategoryOption, setSubCategoryOption] = useState([
    {
      statusText: subCategoryText,
      options: [],
    },
  ]);
  const handleDefaultCategory = (event) => {
    event.preventDefault();
    setCategory('');
    setCategoryText('Category');
    setCategoryOption((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[0].statusText = 'Category';
      return updatedOptions;
    });
  };
  const handleCategory = (event) => {
    const id = categoryOption[0].options.filter(
      (name) => name.label === event.target.name
    );
    setCategory(id[0].id);
    const value = event.target.getAttribute('name');
    setCategoryText(value);
    setCategoryOption((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[0].statusText = value;
      return updatedOptions;
    });
  };
  const handleDefaultSubcategory = (event) => {
    event.preventDefault();
    setSubcategory('');
    setSubcategoryText('Subcategory');
    setSubCategoryOption((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[0].statusText = 'Sub Category';
      return updatedOptions;
    });
  };

  const handleSubcategory = (event) => {
    const id = subCategoryOption[0].options.filter(
      (name) => name.label === event.target.name
    );
    setSubcategory(id[0].id);
    const value = event.target.getAttribute('name');
    setSubcategoryText(value);
    setSubCategoryOption((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[0].statusText = value;
      return updatedOptions;
    });
  };

  const getCategory = async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await categoryApi;
      let { data } = response?.data;
      if (data) {
        const category = data;
        const outputDataArray = [];
        for (const inputData of category) {
          const outputData = {
            id: inputData?.id,
            label: inputData?.name,
            value: inputData?.name,
            parent_id: inputData?.parent_id?.id,
          };
          outputDataArray.push(outputData);
        }

        setCategoryData(outputDataArray);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const getSubCategory = async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await subCategoryApi;
      let { data } = response?.data;
      if (data) {
        const category = data;
        const outputDataArray = [];
        for (const inputData of category) {
          const outputData = {
            id: inputData?.id,
            label: inputData?.name,
            value: inputData?.name,
            handler: handleSubcategory,
            parent_id: inputData?.parent_id?.id,
          };

          outputDataArray.push(outputData);
        }
        setSubCategoryData(outputDataArray);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  useEffect(() => {
    getCategory();
    getSubCategory();
  }, []);

  useEffect(() => {
    getData();
  }, [sortBy, sortOrder, limit, currentPage]);

  useEffect(() => {
    setCurrentPage('1');
    getData();
  }, [category, subCategory, category_id, sub_category_id, search]);

  const getData = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const queryParams = {
        id: id,
        type: type,
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: limit,
        currentPage: currentPage,
        category: category_id?.id,
        subCategory: sub_category_id?.id,
        search: search,
      };

      const res = await listApi(queryParams);
      const attachment = res?.data?.data;
      const outputDataArray = [];
      for (const inputData of attachment) {
        const outputData = {
          id: inputData?.id,
          name: inputData?.name,
          description: inputData?.description,
          attachment_files: inputData?.attachment_files,
          category: inputData?.category_id?.name,
          subcategory: inputData?.sub_category_id?.name,
          attchmentable_type: inputData?.is_archived,
          attachmentable_id: inputData?.attachmentable_type,
          is_archived: inputData?.is_archived,
          created_at: new Date(inputData?.created_at)
            ?.toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            })
            .replace(/\//g, '-'),
          created_by: `${inputData?.created_by?.first_name} ${inputData?.created_by?.last_name}`,
        };
        outputDataArray.push(outputData);
      }
      setAttachmentsSubCategoryList(outputDataArray);
      setTotalRecords(res?.data?.count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (name) => {
    if (name === 'category') {
      setSortBy('category_id');
    } else if (name === 'subcategory') {
      setSortBy('sub_category_id');
    } else {
      setSortBy(name);
    }
    setSortOrder(!sortOrder);
  };

  const handleChange = (selectedOption) => {
    setStatus(selectedOption);
  };

  const tableHeaders = [
    { name: 'created_at', label: 'Created', width: '10%', sortable: true },
    {
      name: 'name',
      label: 'Name',
      width: '20%',
      sortable: true,
    },
    {
      name: 'category',
      label: 'Category',
      width: '10%',
      sortable: true,
    },
    {
      name: 'subcategory',
      label: 'Subcategory',
      width: '10%',
      sortable: true,
    },
    {
      name: 'description',
      label: 'Description',
      width: '20%',
      sortable: true,
    },
    {
      name: 'created_by',
      label: 'Created',
      width: '15%',
      sortable: true,
    },
  ];

  const handleArchive = (rowData) => {
    setShowModel(true);
    setArchiveId(rowData?.id);
  };

  const archieveHandle = async () => {
    try {
      const res = await archiveApi(archiveid);

      if (res?.data?.status === 'success') {
        setShowSuccessMessage(true);
        setShowModel(false);
        getData();
        // toast.success('Attachment is archived.');
      } else {
        toast.error('Attachment is archived.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const optionsConfig = [
    {
      label: 'View',
      path: (rowData) => `${viewEditApi}/${rowData.id}/view`,
      action: (rowData) => {},
    },
    {
      label: 'Edit',
      path: (rowData) => `${viewEditApi}/${rowData.id}/edit`,
      action: (rowData) => {},
    },
    {
      label: 'Archive',
      action: (rowData) => handleArchive(rowData),
    },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <>
      <SuccessPopUpModal
        title="Success!"
        message={'Attachment is archived.'}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        isArchived={false}
        onConfirm={() => {
          setShowSuccessMessage(false);
        }}
        setModalPopUp={setShowSuccessMessage}
      />
      <SuccessPopUpModal
        title={'Confirmation'}
        message={'Are you sure want to archive?'}
        modalPopUp={showModel}
        setModalPopUp={setShowModel}
        isArchived={true}
        archived={archieveHandle}
      />
      <div className="mainContentInner">
        <div className="filterBar px-0 accountFilters notesFilters mb-3">
          <div className="filterInner">
            <h2>Filters</h2>
            <div className="filterIcon" onClick={filterChange}>
              <SvgComponent
                name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
              />
            </div>
            <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
              <form className="d-flex gap-3">
                <SelectDropdown
                  placeholder={'Category'}
                  name="category_id"
                  showLabel={category_id ? true : false}
                  selectedValue={categoryData.find(
                    (option) => option?.value === category_id?.name
                  )}
                  defaultValue={categoryData.find(
                    (option) => option.value === category_id?.name
                  )}
                  required
                  removeDivider
                  onChange={(selectedOption) => {
                    setCategoryId(selectedOption);
                    setSubCategoryId(null);
                  }}
                  options={categoryData}
                />
                <SelectDropdown
                  placeholder={'Subcategory'}
                  name="sub_category_id"
                  showLabel={sub_category_id ? true : false}
                  required
                  removeDivider
                  selectedValue={sub_category_id}
                  onChange={(selectedOption) => {
                    // Update the selected value in the state
                    setSubCategoryId(selectedOption);
                  }}
                  disabled={!category_id}
                  options={subCategoryData?.filter(
                    (el) => el.parent_id == category_id?.id
                  )}
                />
              </form>
            </div>
          </div>
          <div className="tabs mt-3 d-flex justify-content-between">
            <ul>
              <li>
                <Link to={notesApi}>Notes</Link>
              </li>
              <li>
                <Link className="active" to={attachmentApi}>
                  Attachments
                </Link>
              </li>
            </ul>
            <Link to={createApi}>
              <button className="btn btn-md btn-primary createButton">
                Add Attachment
              </button>
            </Link>
          </div>
        </div>
        <TableList
          isLoading={isLoading}
          data={attachmentsSubCategoryList}
          headers={tableHeaders}
          handleSort={handleSort}
          // sortName={sortName}
          // sortOrder={sortOrder}
          optionsConfig={optionsConfig}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={+currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
    </>
  );
}
