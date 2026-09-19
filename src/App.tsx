import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StocksPage } from './components/Stocks';
import { ProductSources } from './components/ProductSources';
import AppLayout from './layouts/AppLayout';

// Auth & Settings
import Login from './components/Auth/Login';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { UserProfilePage } from './components/Settings/UserProfilePage';
import { BusinessSettingsPage } from './components/Settings/BusinessSettingsPage';

// Overview
import { Dashboard } from './components/Dashboard';

// Inventory & Stocks
import { Products } from './components/Products';
import ProductDetails from './components/Products/ProductDetails';
import CategoriesPage from './components/Categories';
import { UsersPage } from './components/Users';
import { SuppliersPage } from './components/Suppliers';
import { ReportsPage } from './components/Reports';
import { StockMovementsPage } from './components/StockMovements';
import { AuditLogsPage } from './components/AuditLogs';
import { PurchaseOrdersPage } from './components/PurchaseOrders';
import StoresPage from './components/Stores';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Overview */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/reports" element={<ReportsPage />} /> */}

            {/* Inventory */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/stock-movements" element={<StockMovementsPage />} />

            {/* Procurement */}
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/product-sources" element={<ProductSources />} />

            {/* Administration */}
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />

            {/* Settings */}
            <Route
              path="/settings/business"
              element={<BusinessSettingsPage />}
            />
            <Route path="/settings/profile" element={<UserProfilePage />} />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
