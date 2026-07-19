import api from "./api";

const unwrap = (response) => response.data.data ?? response.data;

export const startInterview = async (type, difficulty) => {
  const response = await api.post("/mock/start", { type, difficulty });
  return unwrap(response);
};

export const getInterview = async (interviewId) => {
  const response = await api.get(`/mock/${interviewId}`);
  return unwrap(response);
};

export const submitAnswer = async (interviewId, answer) => {
  const response = await api.post(`/mock/${interviewId}/answer`, { answer });
  return unwrap(response);
};

export const endInterview = async (interviewId) => {
  const response = await api.post(`/mock/${interviewId}/end`);
  return unwrap(response);
};

export const getReport = async (interviewId) => {
  const response = await api.get(`/mock/${interviewId}/report`);
  return unwrap(response);
};

export const speakQuestion = async (interviewId, text) => {
  const response = await api.post(`/mock/${interviewId}/speak`, { text });
  return unwrap(response);
};
