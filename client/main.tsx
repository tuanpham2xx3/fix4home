import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterTechnician from "./pages/RegisterTechnician";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerOrders from "./pages/customer/Orders";
import CustomerOrderDetail from "./pages/customer/OrderDetail";
import CustomerProfile from "./pages/customer/Profile";
import CustomerReviews from "./pages/customer/Reviews";

// Booking Pages
import BookService from "./pages/booking/BookService";
import TechnicianSelection from "./pages/booking/TechnicianSelection";
import ConfirmBooking from "./pages/booking/ConfirmBooking";

// Technician Pages
import TechnicianDashboard from "./pages/technician/Dashboard";
import TechnicianJobs from "./pages/technician/Jobs";
import TechnicianJobDetail from "./pages/technician/JobDetail";
import TechnicianCalendar from "./pages/technician/Calendar";
import TechnicianProfile from "./pages/technician/Profile";
import TechnicianStatistics from "./pages/technician/Statistics";
import TechnicianReviews from "./pages/technician/Reviews";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminTechnicians from "./pages/admin/Technicians";
import AdminOrders from "./pages/admin/Orders";
import AdminServices from "./pages/admin/Services";
import AdminReports from "./pages/admin/Reports";

// Chat Page
import ChatPage from "./pages/Chat";

// Service Posts Pages
import ServicePosts from "./pages/ServicePosts";
import ServicePostDetailPage from "./pages/ServicePostDetail";
import CustomerServicePosts from "./pages/customer/ServicePosts";

// Payment Pages
import CustomerPayments from "./pages/customer/Payments";
import TechnicianPayments from "./pages/technician/Payments";

// Admin Pages
import AdminPayments from "./pages/admin/Payments";
import AdminNotificationsPage from "./pages/admin/Notifications";

const queryClient = new QueryClient();

// Get basename from environment or use default for GitHub Pages
const basename =
  import.meta.env.MODE === "production" ? "/fix4home_ver0.1" : "";

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          <BrowserRouter basename={basename}>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/service-posts" element={<ServicePosts />} />
                <Route path="/service-posts/:id" element={<ServicePostDetailPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/register-customer"
                  element={<RegisterCustomer />}
                />
                <Route
                  path="/register-technician"
                  element={<RegisterTechnician />}
                />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Chat Routes */}
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute allowedRoles={["customer", "technician"]}>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:id"
                  element={
                    <ProtectedRoute allowedRoles={["customer", "technician"]}>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />

                {/* Customer Protected Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerOrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/profile"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/reviews"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/service-posts"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerServicePosts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/payments"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerPayments />
                    </ProtectedRoute>
                  }
                />

                {/* Booking Flow Routes */}
                <Route
                  path="/booking/service/:id"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <BookService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/technician/:serviceId"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <TechnicianSelection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/confirm"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <ConfirmBooking />
                    </ProtectedRoute>
                  }
                />

                {/* Technician Protected Routes */}
                <Route
                  path="/technician/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/jobs"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/jobs/:id"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianJobDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/calendar"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/profile"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/statistics"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianStatistics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/reviews"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/payments"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianPayments />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/technicians"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminTechnicians />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminNotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route - must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
