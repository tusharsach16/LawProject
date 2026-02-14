import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";

const Home = lazy(() => import("./pages/Home"));
const Signin = lazy(() => import("./pages/Signin"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LawyerDashboard = lazy(() => import("./pages/LawyerDashboard"));
const MockTrialLobby = lazy(() => import("./pages/MockTrialLobby"));
const ConnectWithLawyers = lazy(() => import("./pages/ConnectWithLawyers"));
const ForgotPasswordFlow = lazy(() => import("./pages/ForgotPassword"));

import TermsAndConditions from "./pages/legal/TermsAndConditions";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ContactUs from "./pages/legal/ContactUs";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/mock-trials" element={<MockTrialLobby />} />
            <Route path="/talk-to-lawyer" element={<ConnectWithLawyers />} />
            <Route path="/forgotpassword" element={<ForgotPasswordFlow />} />
          </Route>

          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lawyer-dashboard/*"
            element={
              <ProtectedRoute>
                <LawyerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
