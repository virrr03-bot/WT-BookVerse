import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Modular Page Components
import HomeCatalog from './pages/HomeCatalog';
import LoginRegister from './pages/LoginRegister';
import CartCheckout from './pages/CartCheckout';
import CustomerOrders from './pages/CustomerOrders';
import MerchantDashboard from './pages/MerchantDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import SupportDashboard from './pages/SupportDashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Global Multi-Role Navigation Header */}
        <Navbar />

        {/* Dynamic Route Viewport */}
        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          <Routes>
            {/* 1. PUBLIC ROUTES */}
            <Route path="/" element={<HomeCatalog />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/register" element={<LoginRegister />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* 2. CUSTOMER PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="/cart" element={<CartCheckout />} />
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="/support-request" element={<CustomerOrders />} />
            </Route>

            {/* 3. FRESH SELLER MERCHANT ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['fresh_seller']} />}>
              <Route path="/seller/fresh" element={<MerchantDashboard />} />
              <Route path="/seller/fresh/add" element={<MerchantDashboard />} />
              <Route path="/seller/fresh/inventory" element={<MerchantDashboard />} />
            </Route>

            {/* 4. 2ND HAND SELLER MERCHANT ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['used_seller']} />}>
              <Route path="/seller/used" element={<MerchantDashboard />} />
              <Route path="/seller/used/add" element={<MerchantDashboard />} />
              <Route path="/seller/used/inventory" element={<MerchantDashboard />} />
            </Route>

            {/* 5. MARKETING TEAM CAMPAIGN CONTROL ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['marketing']} />}>
              <Route path="/marketing/campaigns" element={<MarketingDashboard />} />
            </Route>

            {/* 6. SUPPORT TEAM TICKETS & USER LOOKUP ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['support']} />}>
              <Route path="/support/tickets" element={<SupportDashboard />} />
              <Route path="/support/users" element={<SupportDashboard />} />
            </Route>

            {/* 7. 404 CATCH-ALL ROUTE */}
            <Route
              path="*"
              element={
                <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>404</h2>
                    <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
                      The requested page or dashboard does not exist.
                    </p>
                    <a href="/" className="btn btn-primary">
                      Return to Catalog
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
