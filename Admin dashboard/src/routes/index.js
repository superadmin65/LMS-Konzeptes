import React from "react";
import { Navigate } from "react-router-dom";

// // File Manager
// import FileManager from "../pages/FileManager/index";

// // Profile
import UserProfile from "../pages/Authentication/user-profile";

// //Ecommerce Pages
import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
import EcommerceCustomers from "../pages/Ecommerce/EcommerceCustomers/index";

//Invoices
import InvoicesList from "../pages/Invoices/Exercise-list";
import FieldManagement from "../pages/Invoices/Field-list";
import InvoiceDetail from "../pages/Invoices/Exercise-detail";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";

//  // Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login";
import Login2 from "../pages/AuthenticationInner/Login2";
import Register1 from "../pages/AuthenticationInner/Register";
import Register2 from "../pages/AuthenticationInner/Register2";
import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
import Recoverpw2 from "../pages/AuthenticationInner/Recoverpw2";
import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
import ForgetPwd2 from "../pages/AuthenticationInner/ForgetPassword2";
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen";
import LockScreen2 from "../pages/AuthenticationInner/auth-lock-screen-2";
import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "../pages/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "../pages/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "../pages/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "../pages/AuthenticationInner/auth-two-step-verification-2";

// Dashboard
import Dashboard from "../pages/Dashboard/index";

//Tables
import ResponsiveTables from "../pages/Tables/ResponsiveTables";

import ManageCards from "../pages/Ecommerce/ManageCard";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/manage-cards", component: <ManageCards /> },
  { path: "/profile", component: <UserProfile /> },
  // { path: '/ecommerce-orders', component: <EcommerceOrders /> },
  { path: "/staff-list", component: <EcommerceOrders /> },
  // { path: '/ecommerce-customers', component: <EcommerceCustomers /> },
  { path: "Registration-List", component: <EcommerceCustomers /> },

  //Invoices
  // { path: '/invoices-list', component: <InvoicesList /> },
  { path: "Exercise-type", component: <InvoicesList /> },
  { path: "/Exercise-detail/:id", component: <InvoiceDetail /> },
  { path: "/Exercise-detail", component: <InvoiceDetail /> },
  { path: "/Field-list", component: <FieldManagement /> },

  //Tables
  // { path: '/tables-responsive', component: <ResponsiveTables /> },
  { path: "/Performance-table", component: <ResponsiveTables /> },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },

  // Authentication Inner
  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-login-2", component: <Login2 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/pages-register-2", component: <Register2 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/page-recoverpw-2", component: <Recoverpw2 /> },
  { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  { path: "/auth-recoverpw-2", component: <ForgetPwd2 /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
  { path: "/auth-lock-screen-2", component: <LockScreen2 /> },
  { path: "/page-confirm-mail", component: <ConfirmMail /> },
  { path: "/page-confirm-mail-2", component: <ConfirmMail2 /> },
  { path: "/auth-email-verification", component: <EmailVerification /> },
  { path: "/auth-email-verification-2", component: <EmailVerification2 /> },
  { path: "/auth-two-step-verification", component: <TwostepVerification /> },
  {
    path: "/auth-two-step-verification-2",
    component: <TwostepVerification2 />,
  },
];

export { authProtectedRoutes, publicRoutes };
