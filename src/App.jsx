import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LandingPage from "./LandingPage";
import DailyTasks from "./pages/DailyTasks";
import Journal from "./pages/Journal";
import LifeCalendar from "./pages/LifeCalendar";
import DailyRoutine from "./pages/DailyRoutine";
import LearningDashboard from "./pages/LearningDashboard";
import Navbar from "./components/Navbar";
import "./App.css";

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <div
        className={`app-container with-navbar ${location.pathname === "/" ? "home-page-active" : ""}`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/daily-tasks" element={<DailyTasks />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/life-calendar" element={<LifeCalendar />} />
          <Route path="/daily-routine" element={<DailyRoutine />} />
          <Route path="/learning-dashboard" element={<LearningDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
