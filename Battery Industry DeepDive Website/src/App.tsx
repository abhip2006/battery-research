import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { CompaniesPage } from './components/CompaniesPage';
import { SubsectorsPage } from './components/SubsectorsPage';
import { InvestmentsPage } from './components/InvestmentsPage';
import { ForecastsPage } from './components/ForecastsPage';
import { ReportsPage } from './components/ReportsPage';
import { AboutPage } from './components/AboutPage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingChatbot } from './components/FloatingChatbot';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/subsectors" element={<SubsectorsPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/forecasts" element={<ForecastsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
        <FloatingChatbot />
      </div>
    </Router>
  );
}