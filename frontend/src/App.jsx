import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import DSATrackerPage from "./pages/DSATrackerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/dsa" element={<DSATrackerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
