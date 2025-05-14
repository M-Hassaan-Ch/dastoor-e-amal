import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import Login from "./pages/Login";
import DailyTasks from "./pages/DailyTasks";
import Journal from "./pages/Journal";
import LifeCalendar from "./pages/LifeCalendar";
import DailyRoutine from "./pages/DailyRoutine";
import LearningDashboard from "./pages/LearningDashboard";
import SignUp from './pages/SignUp';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    window.addEventListener('authStateChange', handleAuthChange);
    return () => window.removeEventListener('authStateChange', handleAuthChange);
  }, []);

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div className={`app-container ${isAuthenticated ? 'with-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/daily-tasks" /> : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/daily-tasks" /> : <SignUp />
          } />
          <Route path="/daily-tasks" element={
            <ProtectedRoute>
              <DailyTasks />
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          } />
          <Route path="/life-calendar" element={
            <ProtectedRoute>
              <LifeCalendar />
            </ProtectedRoute>
          } />
          <Route path="/daily-routine" element={
            <ProtectedRoute>
              <DailyRoutine />
            </ProtectedRoute>
          } />
          <Route path="/learning-dashboard" element={
            <ProtectedRoute>
              <LearningDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
