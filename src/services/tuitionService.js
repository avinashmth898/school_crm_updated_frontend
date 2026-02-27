import apiClient from "./apiClient";

// GET all tuition fees
export const getTuitionFees = () =>
  apiClient.get("/config/tuition");

// CREATE new fee
export const createTuitionFee = (data) =>
  apiClient.post("/config/tuition", data);

// UPDATE fee
export const updateTuitionFee = (className, data) =>
  apiClient.put(`/config/tuition/${className}`, data);
