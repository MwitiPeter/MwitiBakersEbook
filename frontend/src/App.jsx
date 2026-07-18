import { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import NavigationLoader from './components/NavigationLoader';

// Preload function — call on hover to eagerly load page chunks
const preloadPage = (importFn) => { importFn(); };

// Lazy-loaded pages for faster initial load
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RecipeBooks = lazy(() => import('./pages/RecipeBooks'));
const TrainingVideos = lazy(() => import('./pages/TrainingVideos'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Expose preload helpers globally for Navbar hover preloading
if (typeof window !== 'undefined') {
  window.__preload = {
    dashboard: () => preloadPage(() => import('./pages/Dashboard')),
    recipeBooks: () => preloadPage(() => import('./pages/RecipeBooks')),
    trainingVideos: () => preloadPage(() => import('./pages/TrainingVideos')),
    admin: () => preloadPage(() => import('./pages/AdminDashboard')),
  };
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { endNavigation } = useNavigation();
  if (loading) return <LoadingScreen />;
  if (!user) {
    endNavigation();
    return <Navigate to="/login" />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { endNavigation } = useNavigation();
  if (loading) return <LoadingScreen />;
  if (!user) {
    endNavigation();
    return <Navigate to="/login" />;
  }
  if (user.role !== 'admin') {
    endNavigation();
    return <Navigate to="/dashboard" />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const { endNavigation } = useNavigation();
  if (loading) return <LoadingScreen />;
  return children;
}

function AppContent() {
  const { endNavigation } = useNavigation();

  const handlePageLoaded = useCallback(() => {
    endNavigation();
  }, [endNavigation]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationLoader />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/recipe-books" element={<ProtectedRoute><RecipeBooks /></ProtectedRoute>} />
            <Route path="/training-videos" element={<ProtectedRoute><TrainingVideos /></ProtectedRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </HelmetProvider>
  );
}
