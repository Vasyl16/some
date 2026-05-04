import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { PublicOnlyRoute } from "./components/layout/PublicOnlyRoute";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { CandidateApplicationsPage } from "./pages/CandidateApplicationsPage";
import { CandidateJobDetailsPage } from "./pages/CandidateJobDetailsPage";
import { CandidateJobsPage } from "./pages/CandidateJobsPage";
import { CandidateProfilePage } from "./pages/CandidateProfilePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RecruiterJobDetailsPage } from "./pages/RecruiterJobDetailsPage";
import { RecruiterJobsPage } from "./pages/RecruiterJobsPage";
import { RecruiterProfilePage } from "./pages/RecruiterProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { TopsisPage } from "./pages/TopsisPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="candidate" element={<Navigate to="/candidate/profile" replace />} />
        <Route
          path="candidate/profile"
          element={
            <ProtectedRoute role="candidate">
              <CandidateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="candidate/jobs"
          element={
            <ProtectedRoute role="candidate">
              <CandidateJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="candidate/applications"
          element={
            <ProtectedRoute role="candidate">
              <CandidateApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="candidate/jobs/:id"
          element={
            <ProtectedRoute role="candidate">
              <CandidateJobDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="recruiter" element={<Navigate to="/recruiter/profile" replace />} />
        <Route
          path="recruiter/profile"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="recruiter/jobs"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="recruiter/jobs/:id"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterJobDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="recruiter/topsis"
          element={
            <ProtectedRoute role="recruiter">
              <TopsisPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
