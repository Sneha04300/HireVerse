import api from "./api";

export const getDSADashboard = async () => {
  const response = await api.get("/dsa/dashboard");
  return response.data.data;
};

export const getDSACoach = async () => {
  const response = await api.get("/dsa/coach");
  return response.data.data;
};

export const getAllProblems = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.bookmarked) params.set("bookmarked", "true");
  const qs = params.toString();
  const response = await api.get(`/dsa${qs ? `?${qs}` : ""}`);
  return response.data;
};

export const createProblem = async (data) => {
  const response = await api.post("/dsa", data);
  return response.data;
};

export const updateProblem = async (id, data) => {
  const response = await api.put(`/dsa/${id}`, data);
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await api.delete(`/dsa/${id}`);
  return response.data;
};

export const toggleBookmark = async (id) => {
  const response = await api.patch(`/dsa/${id}/bookmark`);
  return response.data;
};

export const incrementRevision = async (id) => {
  const response = await api.patch(`/dsa/${id}/revise`);
  return response.data;
};

export const getLeetCode = async () => {
  const response = await api.get("/dsa/leetcode");
  return response.data.data;
};

export const connectLeetCode = async (username) => {
  const response = await api.post("/dsa/leetcode/connect", { username });
  return response.data.data;
};
