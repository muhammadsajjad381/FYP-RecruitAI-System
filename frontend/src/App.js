import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
const Navbar = lazy(() => import("./components/Navbar"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Client Pages
const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const Home = lazy(() => import("./pages/home/Home"));
const UploadPage = lazy(() => import("./pages/apply/UploadPage"));
const VoiceSamplePage = lazy(() => import("./pages/voice-sample/VoiceSamplePage"));
const InterviewPage = lazy(() => import("./pages/interview/InterviewPage"));
const ReportPage = lazy(() => import("./pages/report/ReportPage"));
const EditProfile = lazy(() => import("./pages/profile/EditProfile")); 
const UserProfileSettings = lazy(() => import("./pages/profile/UserProfileSettings"));

// Admin Components
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const QuestionBank = lazy(() => import("./pages/admin/QuestionBank"));
const Jobs = lazy(() => import("./pages/admin/Jobs"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Candidates = lazy(() => import("./pages/admin/Candidates"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const Layout = ({ children }) => {
  const location = useLocation();
  
  const hideNavbar = 
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userInfo } = useAuth();
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userInfo.role !== 'Admin' && userInfo.role !== 'SuperAdmin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen bg-[#00050d] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* --- CLIENT / CANDIDATE ROUTES --- */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/apply" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/voicesample" element={<ProtectedRoute><VoiceSamplePage /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/setting" element={<ProtectedRoute><UserProfileSettings /></ProtectedRoute>} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="settings" element={<AdminSettings />} />
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />}/> 
            <Route path="candidates" element={<Candidates />}/> 
            <Route path="questions" element={<QuestionBank />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* --- ERROR HANDLING --- */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;