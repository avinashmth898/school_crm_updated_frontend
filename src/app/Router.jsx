import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import RequireAdmin from "./RequireAdmin";

// Pages
import LoginContainer from "../pages/auth/LoginContainer";
import DashboardPage from "../pages/dashboard/DashboardPage";

import StudentSearchPage from "../pages/students/StudentSearchPage";
import StudentRegistrationPage from "../pages/students/StudentRegistrationPage";
import StudentEditPage from "../pages/students/StudentEditPage";
import StudentProfile from "../pages/students/StudentProfile";
import StudentDashboard from "../pages/students/StudentDashboard";
import AdmissionConfirmation from "../pages/students/AdmissionConfirmation";
import StudentExamPage from "../pages/students/StudentExamPage";

import FeesDashboard from "../pages/fees/FeesDashboard";
import FeeHistory from "../pages/fees/FeeHistory";
import FeePaymentCheckoutPage from "../pages/fees/FeePaymentCheckoutPage";

import CommandCentrePage from "../pages/command/CommandCentrePage";
import FeeChargeManagement from "../pages/command/FeeChargeManagement";
import SessionChargesPage from "../pages/command/SessionChargesPage";
import TransportFeePage from "../pages/command/TransportFeePage";
import TuitionFeePage from "../pages/command/TuitionFeePage";
import ExamManagementPage from "../pages/command/examManagement/ExamManagementPage";
import DocumentGenerator from "../pages/dashboard/formsAndDocuments/DocumentGenerator";
import PromotionPage from "../pages/dashboard/promotions/PromotionPage";
import FinanceReportsPage from "../pages/dashboard/reports/FinanceReportsPage";


import SubjectSetupPage from "../pages/command/SubjectSetupPage";
import ExamSetupPage from "../pages/command/ExamSetupPage";
import SubjectMasterPage from "../pages/command/SubjectMasterPage";
import SchoolInfoPage from "../pages/command/SchoolInfoPage";
import MarksEntryPage from "../pages/command/reportCards/MarksEntryPage";
import GradeBandsPage from "../pages/command/reportCards/GradeBandsPage";
import ReportCardPage from "../pages/command/reportCards/ReportCardPage";
import AdmitCardPage from "../pages/command/reportCards/AdmitCardPage";
import LicenseStatusPage from "../pages/command/license/LicenseStatusPage";
import UsageAnalyticsPage from "../pages/command/analytics/UsageAnalyticsPage";

import TeacherRegistrationPage from "../pages/teachers/TeacherRegistrationPage";
import TeacherList from "../pages/teachers/TeacherList";
import TeacherAttendancePage from "../pages/teachers/TeacherAttendancePage";
import TeacherProfile from "../pages/teachers/TeacherProfile";

import UsersPage from "../pages/command/access/UsersPage";
import DevicesPage from "../pages/command/access/DevicesPage";
import TeacherAccessPage from "../pages/command/access/TeacherAccessPage";
import BackupPage from "../pages/command/backup/BackupPage";

import AdminPanelPage from "../pages/admin/AdminPanelPage";

import EdNuvoHubPage from "../pages/ednuvo/EdNuvoHubPage";
import EmsPage from "../pages/ednuvo/EmsPage";
import FmsPage from "../pages/ednuvo/FmsPage";
import SmsPage from "../pages/ednuvo/SmsPage";
import TmsPage from "../pages/ednuvo/TmsPage";

const Router = () => {
  return (
    <Routes>

      <Route path="/login" element={<LoginContainer />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        <Route index element={<DashboardPage />} />

        {/* EDNUVO — groups existing pages into EMS/FMS/SMS/TMS. Nothing
            below moves; this is just a second set of entry points. */}
        <Route path="ednuvo" element={<EdNuvoHubPage />}>
          <Route path="ems" element={<EmsPage />} />
          <Route path="fms" element={<FmsPage />} />
          <Route path="sms" element={<SmsPage />} />
          <Route path="tms" element={<TmsPage />} />
        </Route>

        {/* COMMAND CENTRE */}
        <Route path="command-centre" element={<CommandCentrePage />} />
        <Route path="command-centre/fee-charges" element={<FeeChargeManagement />} />
        <Route path="command-centre/fee-charges/fees-annual" element={<SessionChargesPage />} />
        <Route path="command-centre/fee-charges/transport" element={<TransportFeePage />} />
        <Route path="command-centre/fee-charges/tuition" element={<TuitionFeePage />} />

        <Route path="command-centre/subjects-setup" element={<SubjectSetupPage />} />
        <Route path="command-centre/exams" element={<ExamSetupPage />} />
        <Route path="command-centre/exams/:examId/edit" element={<ExamSetupPage />} />
        <Route path="command-centre/subject-master" element={<SubjectMasterPage />} />
        <Route path="command-centre/school-info" element={<SchoolInfoPage />} />
        <Route path="command-centre/marks-entry" element={<MarksEntryPage />} />
        <Route path="command-centre/grading-scale" element={<GradeBandsPage />} />
        <Route path="command-centre/report-cards" element={<ReportCardPage />} />
        <Route path="command-centre/admit-cards" element={<AdmitCardPage />} />
        <Route path="command-centre/usage-analytics" element={<UsageAnalyticsPage />} />

        {/* ADMIN PANEL — access control, license & backup, split out of
            Command Centre so admin-only account/security controls aren't
            mixed in with day-to-day school configuration. */}
        <Route path="admin-panel" element={<RequireAdmin><AdminPanelPage /></RequireAdmin>} />
        <Route path="admin-panel/users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
        <Route path="admin-panel/devices" element={<RequireAdmin><DevicesPage /></RequireAdmin>} />
        <Route path="admin-panel/teacher-access" element={<RequireAdmin><TeacherAccessPage /></RequireAdmin>} />
        <Route path="admin-panel/license" element={<RequireAdmin><LicenseStatusPage /></RequireAdmin>} />
        <Route path="admin-panel/backup" element={<RequireAdmin><BackupPage /></RequireAdmin>} />

        <Route path="/exam-structure" element={<ExamManagementPage />} />
        <Route path="command-centre/documents" element={<DocumentGenerator />} />
        <Route path="command-centre/promotion" element={<PromotionPage />} />
        <Route path="reports" element={<FinanceReportsPage />} />


        {/* STUDENTS */}
        <Route path="students" element={<StudentSearchPage />} />
        <Route path="students/new" element={<StudentRegistrationPage />} />
        <Route path="students/:regNo/edit" element={<StudentEditPage />} />
        <Route path="students/:regNo" element={<StudentProfile />} />
        <Route path="students/:regNo/dashboard" element={<StudentDashboard />} />
        <Route path="students/:regNo/fee-history" element={<FeeHistory />} />
        <Route path="students/:regNo/pay-fee" element={<FeePaymentCheckoutPage />} />
        <Route path="/students/:regNo/admission-confirmation" element={<AdmissionConfirmation />}/>
        <Route path="/students/:regNo/exams" element={<StudentExamPage />}/>


        {/* TEACHERS */}
        <Route path="teachers" element={<TeacherList />} />
        <Route path="teachers/new" element={<TeacherRegistrationPage />} />
        <Route path="teacher-attendance" element={<TeacherAttendancePage />} />
        <Route path="teachers/:id" element={<TeacherProfile />} />

        {/* FEES — FeesDashboard reads the active tab straight from the URL
            (pay/check/defaulters), so a single wildcard route covers all
            three instead of unused nested routes with no <Outlet/> to render into. */}
        <Route path="fees/*" element={<FeesDashboard />} />

      </Route>

      <Route
        path="*"
        element={
          <div style={{ textAlign: "center", marginTop: 120 }}>
            <img src="/ednuvo_wordmark.png" srcSet="/ednuvo_wordmark.png 1x, /ednuvo_wordmark@2x.png 2x" alt="EdNuvo" style={{ height: 36, marginBottom: 20 }} />
            <h1 style={{ fontSize: 22, fontWeight: 500 }}>Page not found</h1>
            <p style={{ color: "#6b7280" }}>The page you're looking for doesn't exist.</p>
          </div>
        }
      />

    </Routes>
  );
};

export default Router;