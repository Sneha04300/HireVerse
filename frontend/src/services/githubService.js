import api from "./api";

export const getGithubAnalysis = async (userId) => {
  const response = await api.get(`/github/${userId}`);
  return response.data;
};