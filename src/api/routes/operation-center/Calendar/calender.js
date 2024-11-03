import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const ocCalendar = {
  goalvariance: {
    getGoalVariance: async (token) => {
      return await axios.get(`${BASE_URL}/goal_variance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
  filters: {
    getProcedure: async (token) => {
      return await axios.get(
        `${BASE_URL}/procedure_types?page=1&limit=10000&sortName=name&sortOrder=ASC`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    getOrganization: async (token) => {
      return await axios.get(`${BASE_URL}/organizational_levels`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getAllProducts: async (token) => {
      return await axios.get(`${BASE_URL}/products?page=1&limit=10000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    deleteFavoriteFilter: async (token, id) => {
      return await axios.put(
        `${BASE_URL}/operations-center/manage-favorites/archive/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    getProductsById: async (token, productsId) => {
      return await axios.get(
        `${BASE_URL}/operations-center/calender/procedure-type-products/${productsId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    getOperationStatus: async (token) => {
      return await axios.get(
        `${BASE_URL}/booking-drive/operation-status?limit=5000&page=1&status=true&sortName=name&sortOrder=ASC`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    createFavorite: async (token, body) => {
      return await axios.post(
        `${BASE_URL}/operations-center/manage-favorites`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
  },
  createLockDate: async (token, body) => {
    return await axios.post(`${BASE_URL}/lock-dates`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createCloseDate: async (token, body) => {
    return await axios.post(`${BASE_URL}/close-dates`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getCloseDate: async (token) => {
    return await axios.get(
      `${BASE_URL}/close-dates?page=1&limit=10000&type=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getLockDate: async (token) => {
    return await axios.get(`${BASE_URL}/lock-dates?page=1&limit=10000&type=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getView: async (
    token,
    month,
    year,
    viewName,
    startDate,
    endDate,
    weekView
  ) => {
    return await axios.get(
      `${BASE_URL}/operations-center/calender/monthly-view${
        month ? `?month=${month}&year=${year}` : ''
      }${viewName ? `&view_as=${viewName}` : ''}${
        startDate && endDate && weekView
          ? `&week_start_date=${startDate}&week_end_date=${endDate}&week_view=true`
          : ''
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getPromotions: async (token, month, year) => {
    return await axios.get(
      `${BASE_URL}/marketing-equipment/promotions?month=${month}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getBanners: async (token, month, year) => {
    return await axios.get(`${BASE_URL}/banners?month=${month}&year=${year}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getweekView: async (token, month, year, startDate, endDate, viewName) => {
    return await axios.get(
      `${BASE_URL}/operations-center/calender/monthly-view${
        month
          ? `?month=${month}&year=${year}&week_start_date=${startDate}&week_end_date=${endDate}&week_view=true`
          : ''
      }${viewName ? `&view_as=${viewName}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
