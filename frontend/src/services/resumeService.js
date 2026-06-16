import api from "./api";

export const getResumeAnalysis = async (userId) => {
  const response = await api.get(`/resume/${userId}`);
  return response.data;
};