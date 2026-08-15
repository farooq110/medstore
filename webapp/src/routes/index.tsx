import { createBrowserRouter, Navigate } from "react-router-dom"

import { Layout } from "../components/layout/layout"
import ProtectedRoute from "../components/auth/protected-routes"
import PublicRoute from "../components/auth/public-route"
import { USER_ROLES } from "../constants/roles"
import { Login } from "../pages/login"
import { Dashboard } from "../pages/dashboard"
import { POS } from "../pages/pos"
import { OrderList } from "../pages/order-list"
import { OrderDetail } from "../pages/order-detail"
import { Delivery } from "../pages/delivery"
import { Clients } from "../pages/clients"
import { ClientDetail } from "../pages/client-detail"
import { Items } from "../pages/items"
import { Users } from "../pages/users"
import { Alerts } from "../pages/alerts"
import { Reports } from "../pages/reports"
import { Categories } from "../pages/categories"
import { Unauthorized } from "../pages/unauthorized"
import { Register } from "../pages/register"
import { Plans } from "../pages/plans"
import { PublicInvoice } from "../pages/public-invoice"
import { ResetPassword } from "../pages/reset-password"
import { ForgotPassword } from "../pages/forgot-password"
import { Profile } from "../pages/profile"
import PrivacyPolicy from "../pages/privacy-policy"
import AccountDeletion from "../pages/account-deletion"
import VerifyAccountDeletion from "../pages/verify-account-deletion"

export const router = createBrowserRouter([
  {
    path: "/public/invoice/:id/:token",
    element: <PublicInvoice />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/plans",
    element: <Plans />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/account-deletion",
    element: <AccountDeletion />,
  },
  {
    path: "/verify-account-deletion/:id/:token",
    element: <VerifyAccountDeletion />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "pos",
        element: <POS />,
      },
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "delivery",
        element: <Delivery />,
      },
      {
        path: "clients",
        element: <Clients />,
      },
      {
        path: "clients/:id",
        element: <ClientDetail />,
      },
      {
        path: "alerts",
        element: <Alerts />,
      },
      {
        path: "items",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <Items />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <Categories />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.OWNER]}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
])
