import api from "./api";

export const getWeeklyPlan = async (userId) => {
  const response = await api.get(`/weekly-plan/${userId}`);
  return response.data;
};