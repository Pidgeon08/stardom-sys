import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./Layout";

// ================= LOGIN =================
import LoginPage from "./pages/LoginPage";

// ================= ADMIN PAGES =================
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import CourseAdmin from "./pages/admin/CourseAdmin";
import StudentListAdmin from "./pages/admin/StudentListAdmin";
import TeachersAdmin from "./pages/admin/TeachersAdmin";
import ScheduleAdmin from "./pages/admin/ScheduleAdmin";
import BillingAdmin from "./pages/admin/BillingAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";

// ================= TEACHER PAGES =================
import DashboardTeacher from "./pages/teacher/DashboardTeacher";
import MyScheduleTeacher from "./pages/teacher/MyScheduleTeacher";
import MyStudentsTeacher from "./pages/teacher/MyStudentsTeacher";

// ================= STUDENT PAGES =================
import DashboardStudent from "./pages/student/DashboardStudent";
import MyCourseStudent from "./pages/student/MyCourseStudent"; 
import MyScheduleStudent from "./pages/student/MyScheduleStudent";
import MyBillingStudent from "./pages/student/MyBillingStudent";
import SettingsStudent from "./pages/student/SettingsStudent";
import SettingsTeacher from "./pages/teacher/SettingsTeacher";

function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (user) navigate(`/${user.role}`);
    else navigate('/login');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100">
        <h1 className="text-4xl font-black text-red-600 mb-2 italic tracking-tighter">
          ACCESS DENIED
        </h1>
        <p className="text-slate-500 font-medium">
          You do not have permission to access this sector.
        </p>
        <button 
          onClick={handleGoHome}
          className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ADMIN SECTOR */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="courses" element={<CourseAdmin />} />
          <Route path="students" element={<StudentListAdmin />} />
          <Route path="teachers" element={<TeachersAdmin />} />
          <Route path="schedule" element={<ScheduleAdmin />} />
          <Route path="billing" element={<BillingAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
        </Route>

        {/* TEACHER SECTOR */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardTeacher />} />
          <Route path="schedule" element={<MyScheduleTeacher />} />
          <Route path="students" element={<MyStudentsTeacher />} />
          <Route path="settings" element={<SettingsTeacher />} />
        </Route>

        {/* STUDENT SECTOR */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardStudent />} />
          <Route path="courses" element={<MyCourseStudent />} />
          <Route path="schedule" element={<MyScheduleStudent />} />
          <Route path="billing" element={<MyBillingStudent />} />
          <Route path="settings" element={<SettingsStudent />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}