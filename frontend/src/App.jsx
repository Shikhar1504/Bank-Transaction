import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import AdminStats from "./pages/AdminStats";
import { useAuthStore } from "./store/authStore";
import ToastContainer from "./components/ToastContainer";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-2 relative z-10">{children}</main>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Routes>
        {/* Public homepage */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Transfer />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Transactions />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AppLayout>
                <AdminUsers />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute adminOnly>
              <AppLayout>
                <AdminTransactions />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute adminOnly>
              <AppLayout>
                <AdminStats />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
          }
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
