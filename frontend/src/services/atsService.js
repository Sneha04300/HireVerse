import api from "./api";

export const getATSReport = async (userId) => {
  const response = await api.get(`/ats/${userId}`);
  return response.data;
};