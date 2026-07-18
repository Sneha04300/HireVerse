import api from "./api";

const unwrap = (response) => response.data.data ?? response.data;

export const startInterview = async (type, difficulty) => {
  console.log("[mockInterviewService] >>> startInterview request", { type, difficulty });
  const response = await api.post("/mock/start", { type, difficulty });
  const data = unwrap(response);
  console.log("[mockInterviewService] <<< startInterview response", data);
  return data;
};

export const getInterview = async (interviewId) => {
  console.log("[mockInterviewService] >>> getInterview request interviewId:", interviewId);
  const response = await api.get(`/mock/${interviewId}`);
  const data = unwrap(response);
  console.log("[mockInterviewService] <<< getInterview response", data);
  return data;
};

export const submitAnswer = async (interviewId, answer) => {
  console.log("[mockInterviewService] >>> submitAnswer request interviewId:", interviewId, "answer:", answer);
  const response = await api.post(`/mock/${interviewId}/answer`, { answer });
  const data = unwrap(response);
  console.log("[mockInterviewService] <<< submitAnswer response", data);
  return data;
};

export const endInterview = async (interviewId) => {
  console.log("[mockInterviewService] >>> endInterview request interviewId:", interviewId);
  const response = await api.post(`/mock/${interviewId}/end`);
  const data = unwrap(response);
  console.log("[mockInterviewService] <<< endInterview response", data);
  return data;
};

export const getReport = async (interviewId) => {
  console.log("[mockInterviewService] >>> getReport request interviewId:", interviewId);
  const response = await api.get(`/mock/${interviewId}/report`);
  const data = unwrap(response);
  console.log("[mockInterviewService] <<< getReport response", data);
  return data;
};
