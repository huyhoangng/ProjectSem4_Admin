import axios from "axios";

const API_URL = "http://localhost:8080/api/training-packages";

export const getPackages = () => axios.get(API_URL);
export const getPackageById = (id) => axios.get(`${API_URL}/${id}`);
export const createPackage = (data) => axios.post(API_URL, data);
export const updatePackage = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deletePackage = (id) => axios.delete(`${API_URL}/${id}`);
