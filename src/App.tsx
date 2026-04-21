import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { HomePage } from './pages/Home';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import { EmailVerification } from './pages/EmailVerification';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './utils/ProtectedRoute';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/pricing" element={<HomePage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
