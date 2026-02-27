import apiClient from "./apiClient";

// GET all routes
export const getTransportFees = () =>
  apiClient.get("/config/transport");

// CREATE route
export const createTransportFee = (data) =>
  apiClient.post("/config/transport", data);

// DELETE route
export const deleteTransportFee = (id) =>
  apiClient.delete(`/config/transport/${id}`);
