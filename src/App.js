import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import StudentLogin from "./components/StudentLogin";
import TeacherLogin from "./components/TeacherLogin";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StartScanning from "./components/StartScanning";
import ManageAttendance from "./components/ManageAttendance";
import EngagementDetection from "./components/EngagementDetection";
import AddStudents from "./components/AddStudents";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/scan" element={<StartScanning />} />
        <Route path="/manage-attendance" element={<ManageAttendance/>} />
        <Route path="/engagement-tracking" element={<EngagementDetection />} />
        <Route path="/add-students" element={<AddStudents/>} />
  
      </Routes>
    </Router>
  );
}

export default App;