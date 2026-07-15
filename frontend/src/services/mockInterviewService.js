import api from "./api";

export const startInterview = async (type, difficulty) => {
  const response = await api.post("/mock/start", { type, difficulty });
  return response.data;
};

export const getInterview = async (interviewId) => {
  const response = await api.get(`/mock/${interviewId}`);
  return response.data;
};

export const submitAnswer = async (interviewId, answer) => {
  const response = await api.post(`/mock/${interviewId}/answer`, { answer });
  return response.data;
};

export const endInterview = async (interviewId) => {
  const response = await api.post(`/mock/${interviewId}/end`);
  return response.data;
};

export const getReport = async (interviewId) => {
  const response = await api.get(`/mock/${interviewId}/report`);
  return response.data;
};
