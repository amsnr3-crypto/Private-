import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import NewShipment from './pages/NewShipment'
import Tracking from './pages/Tracking'
import Calculator from './pages/Calculator'
import ProfitDashboard from './pages/ProfitDashboard'
import ShipmentsDashboard from './pages/ShipmentsDashboard'
import Quotes from './pages/Quotes'
import PaymentSuccess from './pages/PaymentSuccess'
import Orders from './pages/Orders'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/new-shipment" element={
          <ProtectedRoute><NewShipment /></ProtectedRoute>
        } />

        <Route path="/tracking" element={<Tracking />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/dashboard/profit" element={
          <ProtectedRoute><ProfitDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/shipments" element={
          <ProtectedRoute><ShipmentsDashboard /></ProtectedRoute>
        } />
        <Route path="/quotes" element={
          <ProtectedRoute><Quotes /></ProtectedRoute>
        } />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App