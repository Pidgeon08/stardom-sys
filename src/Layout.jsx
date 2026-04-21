import NavBar from "./components/NavBar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
