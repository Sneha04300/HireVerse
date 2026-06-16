import api from "./api";

export const getDSAProgress = async (userId) => {
  const response = await api.get(`/dsa/${userId}`);
  return response.data;
};