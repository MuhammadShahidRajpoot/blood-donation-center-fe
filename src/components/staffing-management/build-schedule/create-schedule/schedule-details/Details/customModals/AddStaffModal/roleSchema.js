import * as Yup from 'yup';
import { customFieldsValidation } from '../../../../../../../common/customeFileds/yupValidation';
const createDynamicSchema = (customFields, equipment) => {
  const validation = customFieldsValidation(customFields);

  return Yup.object().shape({
    form: Yup.string().required('Form Name is required.'),
    role: Yup.object()
      .required('Role is required.')
      .typeError('Role is required.'),
    quantity: Yup.array().min(1, 'Minimum required Quantity is 1.'),
    ...validation,
  });
};

export default createDynamicSchema;
