import api from "./api";

export const getInterviewReport = async (userId) => {
  const response = await api.get(`/interview/${userId}`);
  return response.data;
};