import _ from 'lodash';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';

const BASE_URL = process.env.REACT_APP_BASE_URL;

async function getUnsyncedDonors(filters, pagination = null) {
  try {
    let url = `${BASE_URL}/contact-donors/unSynced-donors`;
    if (!_.isEmpty(filters)) {
      url = url + `?sortBy=${filters.sortBy}&sortOrder=${filters.sortOrder}`;
    }
    if (pagination) {
      url = url + `&page=${pagination.page}&limit=${pagination.limit}`;
    }
    const result = await makeAuthorizedApiRequest('GET', url);
    return result.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function syncDonorsBBCS(data) {
  try {
    const result = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/contact-donors/sync-donor-bbcs`,
      JSON.stringify(data)
    );
    return result.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function findDonorBBCS(data) {
  try {
    let queryParams = `?first_name=${data.first_name}&last_name=${data.last_name}&birth_date=${data.birth_date}&email=${data.email}`;
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/contact-donors/find-donor-bbcs${queryParams}`
    );
    return result.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getProspectFilters = async () => {
  try {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/filters/single/donors`
    );
    const data = await result.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { getUnsyncedDonors, syncDonorsBBCS, findDonorBBCS, getProspectFilters };
