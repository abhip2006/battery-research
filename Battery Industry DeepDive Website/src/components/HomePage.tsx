import { HeroSection } from './home/HeroSection';
import { IndustryOverview } from './home/IndustryOverview';
import { CompanyDashboard } from './home/CompanyDashboard';
import { InvestmentMap } from './home/InvestmentMap';
import { ForecastExplorer } from './home/ForecastExplorer';
import { ReportsSection } from './home/ReportsSection';

export function HomePage() {
  return (
    <div>
      <HeroSection />
      <IndustryOverview />
      <CompanyDashboard />
      <InvestmentMap />
      <ForecastExplorer />
      <ReportsSection />
    </div>
  );
}
