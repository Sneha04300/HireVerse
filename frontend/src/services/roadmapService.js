import api from "./api";

export const getRoadmap = async (userId) => {
  const response = await api.get(`/roadmap/${userId}`);
  return response.data;
};