import * as Yup from 'yup';
import { customFieldsValidation } from '../../../common/customeFileds/yupValidation';

const projectionsSchema = Yup.object().shape({
  procedure: Yup.object().required('Projection is required.'),
  procedure_type_qty: Yup.string(),
  product_yield: Yup.string(),
  staff_setup: Yup.array(Yup.object()).min(1, 'Staff setup is required.'),
});

const shiftSchema = Yup.object().shape({
  start_time: Yup.string().required('Start time is required.'),
  end_time: Yup.string().required('End time is required.'),
  projections: Yup.array(projectionsSchema),
  remove_projections: Yup.array(Yup.string()),
  devices: Yup.array(Yup.object()),
  staff_break: Yup.boolean(),
  break_start_time: Yup.string().nullable(),
  break_end_time: Yup.string().nullable(),
  reduce_slots: Yup.boolean(),
  appointment_reduction: Yup.number(),
  oef_products: Yup.number(),
  oef_procedures: Yup.number(),
});

const sessionSchema = (customFields, isBlueprint = false) => {
  const customFieldsSchema = customFieldsValidation(customFields);
  return Yup.object().shape({
    ...(isBlueprint
      ? {
          blueprint_name: Yup.object(),
          start_date: Yup.date().required('Start Date is required.'),
          end_date: Yup.date().required('End Date is required.'),
        }
      : { session_date: Yup.date().required('Session Date is required.') }),
    donor_center: Yup.object().required('Donor center is required.'),
    promotions: Yup.array(Yup.object()),
    collection_operation: Yup.object().required(
      'Collection Operation is required.'
    ),
    status: Yup.object().required('Status is required.'),
    shifts: Yup.array(shiftSchema),
    remove_shifts: Yup.array(Yup.string()),
    ...customFieldsSchema,
  });
};

export default sessionSchema;
