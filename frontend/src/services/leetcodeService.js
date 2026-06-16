import api from "./api";

export const getLeetcodeAnalysis = async (userId) => {
  const response = await api.get(`/leetcode/${userId}`);
  return response.data;
};