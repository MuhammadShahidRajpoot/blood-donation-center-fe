const BloodTypes = [
  'A Positive',
  'A Negative',
  'B Positive',
  'B Negative',
  'O Positive',
  'O Negative',
  'AB Positive',
  'AB Negative',
  'Unknown',
];

const Gender = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Neutral / Non-binary', value: 'N' },
];

const FunctionTypeEnum = {
  VOLUNTEER: 1,
  DONOR: 2,
  STAFF: 3,
};

export { BloodTypes, Gender, FunctionTypeEnum };
