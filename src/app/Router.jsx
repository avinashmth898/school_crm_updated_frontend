import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import LoginContainer from "../pages/auth/LoginContainer";
import DashboardPage from "../pages/dashboard/DashboardPage";
import StudentSearchPage from "../pages/students/StudentSearchPage";
import StudentRegistrationPage from "../pages/students/StudentRegistrationPage";
import StudentProfile from "../pages/students/StudentProfile";
import StudentDashboard from "../pages/students/StudentDashboard";

import FeesDashboard from "../pages/fees/FeesDashboard";
import PayFee from "../pages/fees/PayFee";
import CheckFee from "../pages/fees/CheckFee";
import Defaulters from "../pages/fees/Defaulters";

import CommandCentrePage from "../pages/command/CommandCentrePage";
import FeeChargeManagement from "../pages/command/FeeChargeManagement";
import AnnualFeePage from "../pages/command/AnnualFeePage";
import TransportFeePage from "../pages/command/TransportFeePage";
import TuitionFeePage from "../pages/command/TuitionFeePage";
import FeeHistory from "../pages/fees/FeeHistory";
import FeePaymentCheckoutPage from "../pages/fees/FeePaymentCheckoutPage";

const Router = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginContainer />} />

      {/* Protected Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Command Centre */}
        <Route path="command-centre" element={<CommandCentrePage />} />
        <Route path="command-centre/fee-charges" element={<FeeChargeManagement />} />
        <Route path="command-centre/fee-charges/fees-annual" element={<AnnualFeePage />} />
        <Route path="command-centre/fee-charges/transport" element={<TransportFeePage />} />
        <Route path="command-centre/fee-charges/tuition" element={<TuitionFeePage />} />

        {/* Student Dashboard */}
        <Route path="students/:regNo/dashboard" element={<StudentDashboard />} />
        <Route path="students/:regNo/fee-history" element={<FeeHistory />} />
{/*         <Route path="students/:regNo/pay-fee" element={<PayFee />} /> */}
        <Route path="students/:regNo/pay-fee" element={<FeePaymentCheckoutPage />} />

        {/* Students */}
        <Route path="students" element={<StudentSearchPage />} />
        <Route path="students/new" element={<StudentRegistrationPage />} />
        <Route path="students/:regNo" element={<StudentProfile />} />

        {/* Fees */}
        <Route path="fees" element={<FeesDashboard />}>
          <Route path="pay" element={<PayFee />} />
          <Route path="check" element={<CheckFee />} />
          <Route path="defaulters" element={<Defaulters />} />
        </Route>

      </Route>

      {/* Fallback */}
      <Route path="*" element={<h1>404</h1>} />

    </Routes>
  );
};

export default Router;
