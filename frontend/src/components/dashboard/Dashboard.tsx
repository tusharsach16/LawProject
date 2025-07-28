import Header from "./Header";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import ConnectLawyers from "./sidebarComponents/ConnectLawyers";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null); // 👈 Step 1: User state

  // 👇 Step 2: Fetch user from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // token stored after login
        const res = await axios.get("http://localhost:3000/api/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user); // 👈 save user info
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  // 👇 Optional loader
  if (!user) return <div className="p-4 text-gray-600">Loading user data...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed z-30 inset-y-0 left-0 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        </div>

        {/* Scrollable content */}
        <main
          className={`overflow-y-auto flex-1 bg-gray-100 p-4 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <ConnectLawyers/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
