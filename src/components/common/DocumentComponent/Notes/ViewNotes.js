import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SvgComponent from '../../SvgComponent';
import { toast } from 'react-toastify';
import { API } from '../../../../api/api-routes';
import { formatDate } from '../../../../helpers/formatDate';
import { formatUser } from '../../../../helpers/formatUser';
import './index.scss';
import { covertDatetoTZDate } from '../../../../helpers/convertDateTimeToTimezone';

const getNestedValue = (obj, field) => {
  const keys = field.split('.');
  return keys.reduce((result, key) => result[key] || 'N/A', obj);
};
export default function ViewNotes({ editLink }) {
  const [NotesViewData, setNotesViewData] = useState();
  const { noteId } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // getEdit();
    getViewNotes();
  }, []);

  const getViewNotes = async () => {
    try {
      setIsLoading(true);
      const response = await API.crm.documents.notes.getNoteByID(noteId);
      if (response?.data?.data) {
        const notes = response?.data?.data;
        const updated = {
          note_name: notes?.note_name,
          details: notes?.details,
          category_id: notes?.category_id?.name,
          sub_category_id: notes?.sub_category_id?.name,
          created_by: notes?.created_by,
          created_at: notes?.created_at
            ? covertDatetoTZDate(notes?.created_at)
            : '',
          updated_at: notes?.modified_at
            ? covertDatetoTZDate(notes?.modified_at)
            : '',
          updated_by: notes?.modified_by,
          status: notes?.is_active,
        };
        setNotesViewData(updated);

        // setShowUpdatedNote(true);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };
  let data = NotesViewData;

  const config = [
    {
      section: 'Note Details',
      fields: [
        {
          label: 'Name',
          field: 'note_name',
        },
        {
          label: 'Category',
          field: 'category_id',
        },
        {
          label: 'Subcategory',
          field: 'sub_category_id',
        },
      ],
    },
    {
      section: 'Insights',
      fields: [
        {
          label: 'Status',
          field: 'status',
          format: (value) => (value ? 'Active' : 'Inactive'),
        },
        {
          label: 'Created',
          field: 'created_by',
        },
        {
          label: 'Modified',
          field: 'updated_by',
        },
      ],
    },
    {
      section: 'Note',
      fields: [
        {
          label: 'details',
          field: '',
        },
      ],
    },
  ];

  return (
    <>
      {data && (
        <div className="mainContent">
          <div className="mainContentInner viewForm withImageContent">
            <div className="editAnchor">
              <Link to={editLink}>
                <SvgComponent name="EditIcon" />
                <span>Edit Note</span>
              </Link>
            </div>
            <div className="tableView">
              <div className="tablesContainer">
                <div className="leftTables">
                  {config.slice(0, 2).map((section, index) => (
                    <table className="viewTables" key={section.section}>
                      <thead>
                        <tr>
                          <th colSpan="2">{section.section}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <td className='col2 no-data text-center"'>
                            Data Loading
                          </td>
                        ) : (
                          section.fields.map((item) => (
                            <tr key={item.field}>
                              <td className="col1">{item.label}</td>
                              <td className={`col2`}>
                                {item?.field === 'status' ? (
                                  data[item?.field] ? (
                                    <span className="badge active">Active</span>
                                  ) : (
                                    <span className="badge inactive">
                                      Inactive
                                    </span>
                                  )
                                ) : item?.field === 'created_by' ? (
                                  <span>
                                    {formatUser(
                                      data?.created_by ?? data?.created_by
                                    )}
                                    {formatDate(
                                      data?.created_at ?? data?.created_at
                                    )}
                                  </span>
                                ) : item.field === 'updated_by' ? (
                                  <span>
                                    {formatUser(
                                      data?.updated_by
                                        ? data?.updated_by
                                        : data?.created_by
                                    )}
                                    {formatDate(
                                      data?.updated_at
                                        ? data?.updated_at
                                        : data?.created_at
                                    )}
                                  </span>
                                ) : (
                                  getNestedValue(data, item.field)
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ))}
                </div>

                {config.slice(2, 3).map((section, index) => (
                  <div className="rightTables" key={section.section}>
                    <table className="viewTables" key={section.section}>
                      <thead>
                        <tr>
                          <th colSpan="2">{section.section}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {isLoading ? (
                          <td className='col2 no-data text-center"'>
                            Data Loading
                          </td>
                        ) : (
                          section.fields.map((item, index) => (
                            <tr key={index}>
                              <td colSpan={2} key={item.field} className="col2">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      data?.details ||
                                      '<i style="text-align:center;width:100%">N/A </i>',
                                  }}
                                  className={`right-data ${
                                    item.className || ''
                                  }`}
                                ></div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
