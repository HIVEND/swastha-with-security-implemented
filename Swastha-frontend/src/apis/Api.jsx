import axios from "axios";

// Base configuration
const Api = axios.create({
  baseURL: "https://localhost:5000",
  withCredentials: true,
});

// Utility function to get token and set headers dynamically
export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Utility function for multipart/form-data requests
const getMultipartHeaders = () => ({
  headers: {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Test API
export const testApi = () => Api.get("/test");

// User-related APIs
export const registerApi = (data) => Api.post("/api/user/register", data);

export const loginApi = (data) => Api.post("/api/user/login", data);

export const forgotPasswordApi = (data) => 
  Api.post("/api/user/forgot/password", data);
// export const changePasswordApi = (data, userId) => {
//   return Api.put(`/api/user/change/${userId}`, data, getAuthHeaders());
// };

// API function to change password
export const changePasswordApi = (data, userId) => {
  return axios.put(`/api/user/change/${userId}`, data, getAuthHeaders());
};

export const getAllUsersApi = () => Api.get("/api/user/getUsers", getAuthHeaders());

export const getPagination = (currentPage) => 
  Api.get(`/api/user/getPagination?page=${currentPage}`, getAuthHeaders());

export const getSingleUserApi = (id) => 
  Api.get(`/api/user/getUser/${id}`, getAuthHeaders());

export const deleteUserApi = (id) => 
  Api.delete(`/api/user/deleteUser/${id}`, getAuthHeaders());

export const updateUserProfileApi = (id, userData) => 
  Api.put(`/api/user/profile/${id}`, userData, getMultipartHeaders());

// Doctor-related APIs
export const createDoctorApi = (formData) => 
  Api.post("/api/doctor/create_doctor", formData, getMultipartHeaders());

export const getAllDoctorsApi = () => 
  Api.get("/api/doctor/get_doctors", getAuthHeaders());

export const getSingleDoctorApi = (id) => 
  Api.get(`/api/doctor/get_doctor/${id}`, getAuthHeaders());

export const updateDoctorApi = (id, formData) => 
  Api.put(`/api/doctor/update_doctor/${id}`, formData, getMultipartHeaders());

export const deleteDoctorApi = (id) => 
  Api.delete(`/api/doctor/delete_doctor/${id}`, getAuthHeaders());

export const getPaginationApi = (currentPage) => 
  Api.get(`/api/doctor/getPagination?page=${currentPage}`, getAuthHeaders());

// Appointment-related APIs
export const bookappointmentApi = (data) => 
  Api.post(`/api/appointment/bookappointment`, data, getAuthHeaders());

export const getAppointments = () => 
  Api.get("/api/appointment/getappointment", getAuthHeaders());

export const deleteAppointmentApi = (id) => 
  Api.delete(`/api/appointment/deleteAppointment/${id}`, getAuthHeaders());

export const getPaginationAppointmentApi = (currentPage) => 
  Api.get(`/api/appointment/getPagination?page=${currentPage}`, getAuthHeaders());

// Doctor-specific appointment APIs
export const doctorAppointmentApi = () => 
  Api.get(`/api/appointment/doctor/getappointment`, getAuthHeaders());

export const doctorSingleAppointmentApi = (id) => 
  Api.get(`/api/appointment/doctor/appointment/${id}`, getAuthHeaders());

// Product-related APIs
export const createProductApi = (formData) => 
  Api.post("/api/products/create", formData, getMultipartHeaders());

export const deleteProductApi = (id) => 
  Api.delete(`/api/products/${id}`, getAuthHeaders());

export const getProductsApi = (id) => 
  Api.get(`/api/products/${id}`, getAuthHeaders());

export const getAllProductsApi = () => 
  Api.get(`/api/products`, getAuthHeaders());

export const logUserActivityApi = (data) =>
  Api.post("/api/audit/log", data, getAuthHeaders());

// Function to get user audit trail
export const getUserAuditApi = (userId) => {
  return axios.get(`/api/user/audits/${userId}`);
};
