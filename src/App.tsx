import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Layout & Common
import AppLayout from './layouts/AppLayout';
import { SplashScreen } from './common/SplashScreen';
import { useAuth } from './services/auth/hooks/useAuth';

import { UserPermission } from './enum/user_permission.enum';

// Auth & Settings
import Login from './components/Auth/Login';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { UserProfilePage } from './components/Settings/UserProfilePage';
import Settings from './components/Settings/Business/Settings';

// Overview
import { Dashboard } from './components/Dashboard';
import { ReportsPage } from './components/Reports';
import { FeedPage } from './pages/FeedPage';
import { PublishPage } from './pages/PublishPage';

// Inventory & Stocks
import { Products } from './components/Products';
import ProductDetails from './components/Products/ProductDetails';
import { StocksPage } from './components/Stocks';
import { StockDetailPage } from './components/Stocks/StockContextDetails';
import CategoriesPage from './components/Categories';
import { StockMovementsPage } from './components/StockMovements';

// Procurement
import { PurchaseOrdersPage } from './components/PurchaseOrders';
import { SuppliersPage } from './components/Suppliers';
import { ProductSources } from './components/ProductSources';

// Administration
import StoresPage from './components/Stores';
import { UsersPage } from './components/Users';
import { AuditLogsPage } from './components/AuditLogs';
import { IndexRedirect } from './components/Auth/IndexRedirect';
import { PermissionGuard } from './components/Auth/PermissionsGuard';

// ==========================================
// 2. MAIN APP ROUTER
// ==========================================
export default function App() {
  const { isInitializing, isLoading } = useAuth();

  if (isInitializing || isLoading) {
    return <SplashScreen />; // Prevents child components from firing API calls too early!
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Dynamic Root Route */}
            <Route path="/" element={<IndexRedirect />} />

            {/* Overview */}
            <Route
              element={
                <PermissionGuard permissions={UserPermission.DASHBOARD_VIEW} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route
              element={
                <PermissionGuard permissions={UserPermission.REPORT_VIEW} />
              }
            >
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Notice Board */}
            <Route path="/notices/feeds" element={<FeedPage searchTerm="" />} />
            <Route
              element={
                <PermissionGuard
                  permissions={UserPermission.BUSINESS_SETTINGS_UPDATE}
                />
              }
            >
              <Route path="/notices/publish" element={<PublishPage />} />
            </Route>

            {/* Inventory */}
            <Route
              element={
                <PermissionGuard permissions={UserPermission.PRODUCT_READ} />
              }
            >
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
            </Route>

            <Route
              element={
                <PermissionGuard permissions={UserPermission.STOCK_READ} />
              }
            >
              <Route path="/stocks" element={<StocksPage />} />
              <Route path="/stocks/:stockId" element={<StockDetailPage />} />
            </Route>

            <Route
              element={
                <PermissionGuard permissions={UserPermission.CATEGORY_READ} />
              }
            >
              <Route path="/categories" element={<CategoriesPage />} />
            </Route>

            <Route
              element={
                <PermissionGuard
                  permissions={UserPermission.STOCK_MOVEMENT_READ}
                />
              }
            >
              <Route path="/stock-movements" element={<StockMovementsPage />} />
            </Route>

            {/* Procurement */}
            <Route
              element={
                <PermissionGuard permissions={UserPermission.PURCHASE_READ} />
              }
            >
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            </Route>

            <Route
              element={
                <PermissionGuard permissions={UserPermission.SUPPLIER_READ} />
              }
            >
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>

            <Route
              element={
                <PermissionGuard
                  permissions={UserPermission.PRODUCT_SOURCE_READ}
                />
              }
            >
              <Route path="/product-sources" element={<ProductSources />} />
            </Route>

            {/* Administration */}
            <Route
              element={
                <PermissionGuard permissions={UserPermission.STORE_READ} />
              }
            >
              <Route path="/stores" element={<StoresPage />} />
            </Route>

            <Route
              element={
                <PermissionGuard
                  permissions={[
                    UserPermission.USER_READ,
                    UserPermission.ROLE_READ,
                  ]}
                  mode="any"
                />
              }
            >
              <Route path="/users" element={<UsersPage />} />
            </Route>

            <Route
              element={
                <PermissionGuard permissions={UserPermission.AUDIT_LOG_READ} />
              }
            >
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* Settings */}
            <Route
              element={
                <PermissionGuard
                  permissions={UserPermission.BUSINESS_SETTINGS_READ}
                />
              }
            >
              <Route path="/settings/business" element={<Settings />} />
            </Route>

            {/* User Profile (Accessible to all logged-in users) */}
            <Route path="/settings/profile" element={<UserProfilePage />} />
          </Route>
        </Route>

        {/* Catch-all Wildcard: Redirects to dynamic root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
