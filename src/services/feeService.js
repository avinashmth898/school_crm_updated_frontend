import api from "./apiClient";

/* ========= MASTER DATA ========= */

export const getTuitionFees = () =>
  api.get("/fee/tuition");

export const updateTuitionFee = (className, amount) =>
  api.put(`/fee/tuition/${className}`, { amount });

export const getAnnualFees = () =>
  api.get("/fee/annual");

export const updateAnnualFee = (id, amount) =>
  api.put(`/fee/annual/${id}`, { amount });

export const getTransportRoutes = () =>
  api.get("/fee/transport/routes");

/* ========= OPERATIONS ========= */

export const generateMonthlyFee = (payload) =>
  api.post("/fee/generate", payload);

export const payFee = (payload) =>
  api.post("/fee/pay", payload);

/* ========= QUERIES ========= */

export const getStudentFeeLedger = (regNo) =>
  api.get(`/fee/student/${regNo}`);

export const getDefaulters = (month, year) =>
  api.get(`/fee/defaulters?month=${month}&year=${year}`);
