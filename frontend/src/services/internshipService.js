import api from "./api";

export const getInternships = async (userId) => {
  const response = await api.get(`/internship/${userId}`);
  return response.data;
};