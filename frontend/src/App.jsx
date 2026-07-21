import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import DSATrackerPage from "./pages/DSATrackerPage";
import MockInterviewPage from "./pages/MockInterviewPage";
import CareerCopilotPage from "./pages/CareerCopilotPage";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/dsa" element={<DSATrackerPage />} />
        <Route path="/mock" element={<MockInterviewPage />} />
        <Route path="/copilot" element={<CareerCopilotPage />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
