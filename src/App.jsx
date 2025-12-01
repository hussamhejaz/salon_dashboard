import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

import SalonDashboardLayout from "./layouts/SalonDashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Login from "./pages/dashboard/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SectionsPageDash from "./pages/dashboard/SectionsPageDash";
import ProfilePage from "./pages/dashboard/ProfilePage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import WorkingHoursPagedDash from "./pages/dashboard/WorkingHoursPagedDash";
import HomeServicesPageDash from './pages/dashboard/HomeServicesPageDash';
import OffersPageDash from './pages/dashboard/OffersPageDash';
import PricingPageDash from './pages/dashboard/PricingPageDash';

import CreateBooking from "./pages/dashboard/CreateBooking";
import Booking from "./pages/dashboard/Booking";
import BookingDetailsPage from "./pages/dashboard/BookingDetailsPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import HomeServiceBookings from "./pages/dashboard/home-service-bookings";
import NotificationsCenter from "./pages/dashboard/NotificationsCenter";
import CreateHomeServiceBooking from './pages/dashboard/CreateHomeServiceBooking';
import ReviewsPage from './pages/dashboard/ReviewsPage';
import ContactsPage from './pages/dashboard/ContactsPage'



export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const authed = isAuthenticated;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ===== ROOT REDIRECT ===== */}
      <Route 
        path="/" 
        element={
          authed ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } 
      />

      {/* ===== LOGIN (PUBLIC) ===== */}
      <Route 
        path="/login" 
        element={
          authed ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
        } 
      />

      {/* ===== SALON OWNER DASHBOARD (PROTECTED) ===== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SalonDashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* /dashboard */}
        <Route index element={<DashboardHome />} />
        <Route path="services/categories" element={<SectionsPageDash />} />
        <Route path="services/home-services" element={<HomeServicesPageDash />} />
        <Route path="account/profile" element={<ProfilePage />} />
        <Route path="account/notifications" element={<NotificationsPage />} />
        <Route path="settings/hours" element={<WorkingHoursPagedDash/>} />
        <Route path="offers" element={<OffersPageDash />} />
        
        <Route path="pricing" element={<PricingPageDash />} />
        <Route path="appointments/new" element={<CreateBooking/>} />
        <Route path="booking" element={<Booking/>} />
        <Route path="booking/:bookingId" element={<BookingDetailsPage/>} />
        <Route path="clients" element={<ClientsPage/>} />
        <Route path="notifications" element={<NotificationsCenter/>} />
        <Route path="home-service-bookings" element={<HomeServiceBookings/>} />
        <Route path="home-service-bookings/create" element={<CreateHomeServiceBooking />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reviews/featured" element={<ReviewsPage featuredOnly />} />
        <Route path="contacts" element={<ContactsPage />} />
      </Route>
      

      {/* ===== 404 fallback - redirect based on auth status ===== */}
      <Route
        path="*"
        element={
          authed ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}
