export function extractModuleCodes(obj) {
  const moduleCodes = [];

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key].MODULE_CODE) {
      moduleCodes.push(obj[key].MODULE_CODE);
    }

    if (typeof obj[key] === 'object') {
      moduleCodes.push(...extractModuleCodes(obj[key]));
    }
  }

  return moduleCodes;
}

export function removeCountyWord(county) {
  if (county?.includes('County')) {
    county = county.replace('County', '').trim();
  }
  return county;
}

export const replaceSpecialCharacters = (inputString) => {
  // Define a regular expression to match special characters
  const regex = /[!@#$%^&*()_+{}\]:;<>,.?~\\/\-\s]/g;
  // Replace special characters with an empty string
  const resultString = inputString.replace(regex, '');
  return resultString;
};

export const formatPhoneNumber = (phone) => {
  if (phone && !phone.match(/^\(\d{3}\) \d{3}-\d{4}$/)) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
};

export const checkAddressValidation = (longitude, latitude) => {
  if (longitude === '' || latitude === '') {
    return false;
  }
  return true;
};

export function sortByLabel(arr) {
  return arr?.slice()?.sort((a, b) => {
    const labelA = a?.label
      ? a?.label?.trim().toLowerCase()
      : a?.name?.trim().toLowerCase();
    const labelB = b?.label
      ? b?.label?.trim().toLowerCase()
      : b?.name?.trim().toLowerCase();

    if (labelA < labelB) {
      return -1;
    } else if (labelA > labelB) {
      return 1;
    } else {
      return 0;
    }
  });
}

// Global helper function to sort array of objects by the "last_name" property
export function sortByLastName(arr) {
  return arr.slice().sort((a, b) => {
    const lastNameA = a.label
      ? a.label?.split(' ')[1]?.toLowerCase()
      : a.name?.split(' ')[1]?.toLowerCase();
    const lastNameB = b.label
      ? b.label?.split(' ')[1]?.toLowerCase()
      : b.name?.split(' ')[1]?.toLowerCase();

    if (lastNameA < lastNameB) {
      return -1;
    } else if (lastNameA > lastNameB) {
      return 1;
    } else {
      return 0;
    }
  });
}

export const truncateTo50 = (str) =>
  str?.length > 50 ? `${str?.substring(0, 50)}...` : str;
