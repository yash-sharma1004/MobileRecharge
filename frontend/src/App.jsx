import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout/Layout'
import About from './component/About/About'
import Login from './component/LogIn/LogIn'
import ForgotPassword from './component/LogIn/ForgotPassword'
import Promo from './component/Promo/Promo'
import Home from './component/Home/Home'
import Contact from './component/Contact us/Contact'
import Recharge from './component/Recharge/Recharge'
import Help from './component/Help/Help'
import Wallet from './component/Wallet/Wallet'
import History from './component/History/History'
import SignUp from './component/SignUp/SignUp'
import ProtectedRoute from './component/ProtectedRoute'
import Refer from './component/Refer&Earn/Refer'
import ScrollToTop from './component/ScrollToTop'

// Admin Panel Imports
import AdminRoute from './component/Admin/AdminRoute'
import AdminLayout from './component/Admin/AdminLayout'
import AdminDashboard from './component/Admin/AdminDashboard'
import AdminUsers from './component/Admin/AdminUsers'
import AdminRecharges from './component/Admin/AdminRecharges'
import AdminWallet from './component/Admin/AdminWallet'
import AdminCoupons from './component/Admin/AdminCoupons'
import AdminCashback from './component/Admin/AdminCashback'
import AdminReferrals from './component/Admin/AdminReferrals'
import AdminOffers from './component/Admin/AdminOffers'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="signUp" element={<SignUp />} />
          <Route path="promo" element={<Promo />} />
          <Route path="contactUs" element={<Contact />} />
          <Route path="help" element={<Help />} />

          {/* Protected Routes — require authentication */}
          <Route path="recharge" element={
            <ProtectedRoute><Recharge /></ProtectedRoute>
          } />
          <Route path="wallet" element={
            <ProtectedRoute><Wallet /></ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute><History /></ProtectedRoute>
          } />
          <Route path="refer" element={
            <ProtectedRoute><Refer /></ProtectedRoute>
          } />

          {/* Isolated Admin Routes */}
          <Route path="admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="recharges" element={<AdminRecharges />} />
            <Route path="wallet" element={<AdminWallet />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="cashback" element={<AdminCashback />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="offers" element={<AdminOffers />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
