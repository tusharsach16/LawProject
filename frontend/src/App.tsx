import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Dashboard from "./pages/Dashboard";
import Home from './pages/Home';
import Signin from "./pages/Signin";
import SignUp from "./pages/SignUp";
import ConnectWithLawyers from "./pages/ConnectWithLawyers"; 
import ProtectedRoute from "./components/ProtectedRoute";
import MockTrialLobby from "./pages/MockTrialLobby";
import ForgotPasswordFlow from "./pages/ForgotPassword";
// import LawyerDashboard from "./pages/LawyerDashboard";
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mock-trials" element={<MockTrialLobby />} />
          <Route path="/talk-to-lawyer" element={<ConnectWithLawyers />} />
          <Route path="/forgotpassword" element={<ForgotPasswordFlow/>} />
        </Route>

        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        {/* PRIVATE/DASHBOARD ROUTES (Sidebar ke saath)*/}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* <Route
          path="/lawyer-dashboard/*"
          element={
            <ProtectedRoute>
              <LawyerDashboard />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;