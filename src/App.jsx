import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for performance optimization
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const Explore = lazy(() => import("./pages/Explore"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TripProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Toaster position="top-center" />
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trip/:id" 
                  element={
                    <ProtectedRoute>
                      <TripDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/explore" 
                  element={
                    <ProtectedRoute>
                      <Explore />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </TripProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
