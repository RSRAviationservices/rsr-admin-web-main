import { Routes, Route } from "react-router-dom";

import AuthGuard from "./guards/AuthGuard";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/dashboard/page";

import AdminsPage from "@/pages/admins/page";
import AuthPage from "@/pages/auth/AuthPage";
import ApplicationsPage from "@/pages/careers/applications/page";
import CareerFormPage from "@/pages/careers/form/page";
import CareersPage from "@/pages/careers/page";
import InsightFormPage from "@/pages/insights/form/page";
import InsightsPage from "@/pages/insights/page";
import CategoryFormPage from "@/pages/inventory/category-form/page";
import InventoryPage from "@/pages/inventory/page";
import ProductFormPage from "@/pages/inventory/product-form/page";
import LeadsPage from "@/pages/leads/page";
import QuoteDetailsPage from "@/pages/quotes/details/page";
import QuotesPage from "@/pages/quotes/page";
import UsersPage from "@/pages/users/page";
import AdminFormPage from "@/pages/admins/form/page";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<AuthPage />} />

      {/* Protected Routes */}
      <Route element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route
            path="/inventory/category-form"
            element={<CategoryFormPage />}
          />
          <Route path="/inventory/product-form" element={<ProductFormPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/quotes/:id" element={<QuoteDetailsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/admins/form" element={<AdminFormPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/form" element={<CareerFormPage />} />
          <Route path="/careers/applications" element={<ApplicationsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/insights/form" element={<InsightFormPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
