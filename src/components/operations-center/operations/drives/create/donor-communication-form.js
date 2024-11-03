import React, { useEffect } from 'react';
import styles from '../index.module.scss';
import SvgComponent from '../../../../common/SvgComponent';
import { Badge } from 'react-bootstrap';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import FormInput from '../../../../common/form/FormInput';
import { Controller } from 'react-hook-form';

export default function DonorCommunicationForm({
  control,
  setAddAccountsModal,
  selectedAccounts,
  setSelectedAccounts,
  accountRows,
  zipCodes,
  setZipCodes,
  setValue,
  approvals,
  getValues,
  setDonorCommunication,
  donorCommunication,
}) {
  const handleAccountRemove = (account_id) => {
    setSelectedAccounts(selectedAccounts.filter((item) => item !== account_id));
  };

  useEffect(() => {
    if (approvals?.tele_recruitment) {
      setValue('tele_recruitment_status', 'Pending Approval');
    } else {
      setValue('tele_recruitment_status', 'Approved');
    }
    if (approvals?.email) {
      setValue('email_status', 'Pending Approval');
    } else {
      setValue('email_status', 'Approved');
    }
    if (approvals?.sms_texting) {
      setValue('sms_status', 'Pending Approval');
    } else {
      setValue('sms_status', 'Approved');
    }
  }, [approvals]);

  return (
    <div className={`formGroup ${styles.contacts}`}>
      <h5>Donor Communication</h5>
      <Controller
        name="tele_recruitment"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormCheckbox
            name={field.name}
            displayName="Telerecruitment"
            checked={field.value}
            classes={{ root: 'mt-2' }}
            onChange={(e) => {
              field.onChange(e.target.checked);
              e.target.checked
                ? setDonorCommunication((prev) => {
                    return { ...prev, tele_recruitment: true };
                  })
                : setDonorCommunication((prev) => {
                    return { ...prev, tele_recruitment: false };
                  });
            }}
          />
        )}
      />
      <Controller
        name="tele_recruitment_status"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Order Status"
            value={
              donorCommunication?.tele_recruitment == true ? field.value : ''
            }
            required={false}
            disabled={true}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormCheckbox
            name={field.name}
            displayName="Email"
            checked={field.value}
            classes={{ root: 'mt-2' }}
            onChange={(e) => {
              field.onChange(e.target.checked);
              e.target.checked
                ? setDonorCommunication((prev) => {
                    return { ...prev, email_status: true };
                  })
                : setDonorCommunication((prev) => {
                    return { ...prev, email_status: false };
                  });
            }}
          />
        )}
      />
      <Controller
        name="email_status"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Order Status"
            value={donorCommunication?.email_status ? field.value : ''}
            required={false}
            disabled={true}
          />
        )}
      />
      <Controller
        name="sms"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormCheckbox
            name={field.name}
            displayName="SMS"
            checked={field.value}
            classes={{ root: 'mt-2' }}
            onChange={(e) => {
              field.onChange(e.target.checked);
              e.target.checked
                ? setDonorCommunication((prev) => {
                    return { ...prev, sms_status: true };
                  })
                : setDonorCommunication((prev) => {
                    return { ...prev, sms_status: false };
                  });
            }}
          />
        )}
      />
      <Controller
        name="sms_status"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Order Status"
            value={donorCommunication?.sms_status ? field.value : ''}
            required={false}
            disabled={true}
          />
        )}
      />
      <h4>Supplemental Recruitment</h4>
      <div className="w-100 my-2">
        <div className={`tableContainer ${styles.contactTable}`}>
          <table className="viewTables w-100 mt-2 mb-4 rounded-0">
            <thead>
              <tr>
                <td style={{ whiteSpace: 'nowrap' }}>Account</td>
                <td style={{ whiteSpace: 'nowrap' }}>Collection Operation</td>
                <td style={{ whiteSpace: 'nowrap' }}>City</td>
                <td style={{ whiteSpace: 'nowrap' }}>State</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {accountRows && accountRows.length > 0 ? (
                accountRows.map((item, index) => {
                  if (selectedAccounts.includes(item.id.toString()))
                    return (
                      <tr key={index}>
                        <td className="text-nowrap">{item?.name}</td>
                        <td className="text-nowrap">
                          {item?.collection_operation?.name}
                        </td>
                        <td className="text-nowrap">{item?.address?.city}</td>
                        <td className="text-nowrap">{item?.address?.state}</td>
                        <td
                          onClick={() => {
                            handleAccountRemove(item.id);
                          }}
                        >
                          <SvgComponent name={'DrivesCrossIcon'} />
                        </td>
                      </tr>
                    );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="no-data text-sm text-center">
                    No Data selected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="form-field d-flex justify-content-end w-100">
        <button
          type="button"
          onClick={() => {
            setAddAccountsModal(true);
          }}
          className={'btn btn-primary btn-md'}
        >
          Add Account
        </button>
      </div>
      <Controller
        name="zip_codes"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            onChange={(e) => {
              e.preventDefault();
              field.onChange(e);
            }}
            onKeyPress={(e) => {
              if (
                (e.key === 'Enter' || e.keyCode === 13) &&
                e.target.value !== ''
              ) {
                e.preventDefault();
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                value.length > 0 &&
                  setZipCodes((prev) => {
                    return [...prev, value];
                  });
                field.onChange({ target: { value: '' } });
              }
            }}
            displayName="Zip Code"
            value={field?.value}
            required={false}
          />
        )}
      />
      <div className="d-flex w-100">
        <div>
          {zipCodes?.map((item, index) => {
            return (
              <Badge
                key={index}
                bg="secondary"
                className={`${styles.badge} me-3 mb-2`}
              >
                {item}
                <span
                  className="ps-2"
                  onClick={() => {
                    setZipCodes((prev) => {
                      return prev?.filter((obj) => obj !== item);
                    });
                  }}
                >
                  <SvgComponent name={'DrivesCrossIcon'} />
                </span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
