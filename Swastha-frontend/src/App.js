/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEditDoctor from "./pages/admin/AdminEditDoctor";
import AdminView from "./pages/admin/AdminView";
import Appointments from "./pages/admin/Appoinments";
import ProductsPage from "./pages/admin/ProductsPage";
import Users from "./pages/admin/Users";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import AdminRoutes from "./pages/protected_routes/AdminRoutes";
import UserRoutes from "./pages/protected_routes/UserRoutes";
import Register from "./pages/Register";
import AppointmentHistory from "./pages/User/AppointmentHistory";
import Checkout from "./pages/User/Checkout";
import Childcare from "./pages/User/Childcare";
import ChildcareDetail from "./pages/User/ChildcareDetail";
import Details from "./pages/User/Details";
import EmergencyContacts from "./pages/User/EmergencyContacts";
import HealthPackage from "./pages/User/HealthPackage";
import Homepage from "./pages/User/Homepage";
import Success from "./pages/User/Success";
import UserDashboard from "./pages/User/UserDashboard";
import UserProfile from "./pages/User/UserProfile";
import UserAudit from "./pages/User/UserAudit";

function App() {
  // Safely parse the user data from localStorage
  let user;
  try {
    const userJson = localStorage.getItem("user");
    user = userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    user = null; // Fallback to null if there's an error
  }

  return (
    <Router>
      <ToastContainer />
      {/* Conditionally render the Navbar based on user status */}
      {user ? user.isAdmin === false ? <Navbar /> : null : <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/change-password/:userId" element={<ChangePassword />} />
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="/admin/edit/:id" element={<AdminEditDoctor />} />
        <Route path="/admin/view/:id" element={<AdminView />} />
        <Route path="/admin/appointments" element={<Appointments />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route element={<UserRoutes />}>
          <Route path="/homepage" element={<Homepage />} />
        </Route>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/success" element={<Success />} />
        <Route path="/emergency" element={<EmergencyContacts />} />
        <Route path="/childcare" element={<Childcare />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/childcare/:id" element={<ChildcareDetail />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/healthpackages" element={<HealthPackage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/history" element={<AppointmentHistory />} />
        <Route path="/audit" element={<UserAudit />} />
      </Routes>
    </Router>
  );
}

export default App;
