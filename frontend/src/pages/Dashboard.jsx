import { useState } from "react";
import { useNavigate } from "react-router";
import Card from "../components/Card";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <aside className={`bg-base-100 w-64 p-5 space-y-6 ${isSidebarOpen ? "block" : "hidden"} md:block shadow-lg`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Security Dashboard</h1>
          <button className="btn btn-sm md:hidden" onClick={() => setIsSidebarOpen(false)}>X</button>
        </div>
        <nav className="mt-5 space-y-4">
          <button className="btn btn-ghost w-full text-left">Check Reused Passwords</button>
          <button className="btn btn-ghost w-full text-left">Check Compromised Passwords</button>
          <button className="btn btn-ghost w-full text-left">Check Password Strength</button>
          <button className="btn btn-ghost w-full text-left">Add New Company Policy</button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Navbar */}
        <div className="flex items-center justify-between mb-6">
          <button className="btn btn-sm md:hidden" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <h2 className="text-2xl font-semibold">Password Management</h2>
          <button className="btn btn-primary" onClick={() =>{
            navigate("/addpassword")
          }}>Add New Password</button>
        </div>
      </div>
    </div>
  );
}
