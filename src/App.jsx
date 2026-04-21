import { Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import DashboardAdmin from "./pages/DashboardAdmin"
import StudentListAdmin from "./pages/StudentListAdmin";
import ManageSchedule from "./pages/ScheduleAdmin"
import ManageCourses from "./pages/CourseAdmin";
import ManageTeachers from "./pages/TeachersAdmin";
import Layout from "./Layout"

function App() {
  return(
    <Routes>
      <Route path="/" element={<LoginPage />}></Route>
      <Route element={<Layout/>}>
        <Route path="/admin" element={<DashboardAdmin/>}></Route>
        <Route path="/admin/studentlist" element={<StudentListAdmin/>}></Route>
        <Route path="/admin/teacherlist" element={<ManageTeachers/>}></Route>
        <Route path="/admin/courses" element={<ManageCourses/>}></Route>
        <Route path="/admin/schedule" element={<ManageSchedule/>}></Route>
      </Route>
    </Routes>
  )
}

export default App
