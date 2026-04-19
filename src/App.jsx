import { Route, Routes } from "react-router";
import LoginPage from "./pages/loginPage";
import DashboardAdmin from "./pages/DashboardAdmin"
import StudentListAdmin from "./pages/StudentListAdmin";


function App() {
  return(
    <Routes>
      <Route path="/" element={<LoginPage />}></Route>
      <Route path="/admin" element={<DashboardAdmin/>}></Route>
      <Route path="/admin/studentlist" element={<StudentListAdmin/>}></Route>
      <Route path="/admin/courses" element={<DashboardAdmin/>}></Route>
    </Routes>
  )
}

export default App
