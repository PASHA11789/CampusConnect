import axios from 'axios';

const API_URL = '/api/campus-admin';

// Helper to get auth header
const getConfig = () => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Users
export const getUsers = async () => {
  const { data } = await axios.get(`${API_URL}/users`, getConfig());
  return data;
};

export const createUser = async (userData) => {
  const { data } = await axios.post(`${API_URL}/users`, userData, getConfig());
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await axios.delete(`${API_URL}/users/${userId}`, getConfig());
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await axios.put(`${API_URL}/users/${userId}/role`, { role }, getConfig());
  return data;
};

export const resetUserPassword = async (userId, adminPassword, newStudentPassword) => {
  const { data } = await axios.put(
    `${API_URL}/users/${userId}/reset-password`,
    { adminPassword, newStudentPassword },
    getConfig()
  );
  return data;
};

// Restaurants
export const getRestaurants = async () => {
  const { data } = await axios.get(`${API_URL}/restaurants`, getConfig());
  return data;
};

export const createRestaurantAdmin = async (restaurantData) => {
  const { data } = await axios.post(`${API_URL}/restaurants`, restaurantData, getConfig());
  return data;
};

export const deleteRestaurant = async (restaurantId) => {
  const { data } = await axios.delete(`${API_URL}/restaurants/${restaurantId}`, getConfig());
  return data;
};
