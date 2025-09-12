import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Dashboard1 from "./pages/Dashboard1";
import Home from './pages/Home';
import Signin from "./pages/Signin";
import SignUp from "./pages/SignUp";
import ConnectWithLawyers from "./pages/ConnectWithLawyers"; 
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/talk-to-lawyer" element={<ConnectWithLawyers />} />
        </Route>

        {/* PRIVATE/DASHBOARD ROUTES (Sidebar ke saath)*/}
        <Route 
          path="/dashboard1/*" 
          element={
            <ProtectedRoute>
              <Dashboard1 />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;