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

function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
