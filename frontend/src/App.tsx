import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard, TransactionsPage, CreditCardsPage, AnalyticsPage, SavingsPage, SalaryPage, LoginPage } from './pages';
import { ProtectedRoute } from './components';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                    <Route path="/cards" element={<ProtectedRoute><CreditCardsPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/savings" element={<ProtectedRoute><SavingsPage /></ProtectedRoute>} />
                    <Route path="/salary" element={<ProtectedRoute><SalaryPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
