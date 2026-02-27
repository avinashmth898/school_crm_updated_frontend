import apiClient from "./apiClient";

/* ================= TUITION ================= */

// GET all tuition fees
export const getTuitionFees = () =>
  apiClient.get("/fees/config/tuition");

// SET / UPDATE tuition fee
export const setTuitionFee = (className, amount) =>
  apiClient.put(`/fees/config/tuition/${className}`, { amount });

/* ================= TRANSPORT ================= */

export const getTransportFees = () =>
  apiClient.get("/fees/config/transport");

export const addTransportFee = (data) =>
  apiClient.post("/fees/config/transport", data);

export const updateTransportFee = (id, data) =>
  apiClient.put(`/fees/config/transport/${id}`, data);

export const deleteTransportFee = (id) =>
  apiClient.delete(`/fees/config/transport/${id}`);

/* ================= ANNUAL ================= */

export const getAnnualFees = () =>
  apiClient.get("/fees/config/annual");

export const addAnnualFee = (data) =>
  apiClient.post("/fees/config/annual", data);

export const deleteAnnualFee = (id) =>
  apiClient.delete(`/fees/config/annual/${id}`);
