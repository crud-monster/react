import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import UserRoleEdit from "./pages/admin/UserRoles/UserRolesEdit";
import UserRolesList from "./pages/admin/UserRoles/UserRolesList";
import UsersList from "./pages/admin/Users/UsersList";
import Home from "./pages/public/Home/Home";
import ForgottenPassword from "./pages/public/Login/ForgottenPassword";
import ForgottenPasswordReset from "./pages/public/Login/ForgottenPasswordReset";
import Login from "./pages/public/Login/Login";
import PassportCallback from "./pages/public/Login/PassportCallback";
import Register from "./pages/public/Login/Register";
import VerifyUser from "./pages/public/Login/VerifyUser";
import UserInfo from "./pages/public/Login/UserInfo";
import UserDashboard from "./pages/user/UserDashboard/UserDashboard";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/facebook" element={<PassportCallback type="facebook" />} />
        <Route path="/login/github" element={<PassportCallback type="github" />} />
        <Route path="/login/google" element={<PassportCallback type="google" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotten-password/:token" element={<ForgottenPasswordReset />} />
        <Route path="/forgotten-password" element={<ForgottenPassword />} />
        <Route path="/verify-user/:verifyToken" element={<VerifyUser />} />
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/info" element={<ProtectedRoute><UserInfo /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><UsersList adminMode /></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute role="admin"><UserRolesList adminMode /></ProtectedRoute>} />
        <Route path="/user/roles/:id" element={<ProtectedRoute role="admin"><UserRoleEdit /></ProtectedRoute>} />
        <Route path="*" element={<main><h1>Page not found</h1><Link to="/">Go to home page</Link></main>} />
      </Routes>
    </>
  );
}


export default App;
