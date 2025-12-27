import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard, TransactionsPage, CreditCardsPage, AnalyticsPage, SavingsPage } from './pages';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/cards" element={<CreditCardsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/savings" element={<SavingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
