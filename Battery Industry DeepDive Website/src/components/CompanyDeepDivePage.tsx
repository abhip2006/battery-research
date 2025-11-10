import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Zap,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Briefcase,
  Target,
  Clock,
  Award,
} from 'lucide-react';
import { getCompanies, type Company } from '../services/companies.service';

const SECTORS_MAPPING: Record<string, string> = {
  'Solid-state lithium-metal battery': 'Solid-State',
  'Solid-state': 'Solid-State',
  'Silicon anode lithium-ion batteries': 'Silicon Anode',
  'Lithium iron phosphate': 'LFP',
  'Znyth aqueous zinc battery': 'Zinc Battery',
  'Recycling': 'Recycling',
  'Grid Storage': 'Grid Storage',
  'Flow Batteries': 'Flow Batteries',
  'Materials': 'Materials',
};

export function CompanyDeepDivePage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      try {
        setLoading(true);
        const companies = await getCompanies();
        const foundCompany = companies.find((c) => c.id === Number(companyId));

        if (!foundCompany) {
          setError('Company not found');
        } else {
          setCompany(foundCompany);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 text-[#B2FF59] animate-spin" />
          <p className="text-[#FAFAFA]">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen pt-24 bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-400 mb-4">{error || 'Company not found'}</p>
          <button
            onClick={() => navigate('/companies')}
            className="px-6 py-3 bg-[#B2FF59] text-[#0A0A0A] rounded-lg hover:bg-[#A0E050] transition-colors min-h-[44px] font-bold"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const sector = SECTORS_MAPPING[company.technology] || company.technology;
  const isPublic = company.ticker || company.is_publicly_traded;

  return (
    <div className="min-h-screen pt-16 md:pt-24 bg-[#0A0A0A]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-[#B2FF59] hover:text-[#A0E050] transition-colors font-medium"
        >
          <ArrowLeft className="size-4" />
          Back to Companies
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative bg-[#0F0F0F] border-b-4 border-[#B2FF59] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B2FF59]/10 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-start gap-6"
          >
            {/* Company Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#1A1A1A] rounded-xl flex items-center justify-center flex-shrink-0 border-4 border-[#B2FF59] shadow-lg shadow-[#B2FF59]/30">
              <Building2 className="size-10 md:size-12 text-[#B2FF59]" />
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-[#B2FF59] text-3xl md:text-5xl font-extrabold font-tech uppercase tracking-wider">
                  {company.name}
                </h1>
                {company.ticker && (
                  <span className="px-3 py-1 bg-[#B2FF59] text-[#0A0A0A] rounded-lg text-lg font-mono font-bold">
                    {company.ticker}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-[#B2FF59]/20 text-[#B2FF59] rounded-lg font-semibold border-2 border-[#B2FF59]/50">
                  {sector}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-lg font-semibold border-2 ${
                    isPublic
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-[#1565C0]/20 text-[#1565C0] border-[#1565C0]/50'
                  }`}
                >
                  {isPublic ? 'Public Company' : 'Private Company'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#FAFAFA]">
                <MapPin className="size-5 text-[#B2FF59]" />
                <span className="text-lg font-medium">{company.headquarters}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Key Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#0F0F0F] rounded-lg flex items-center justify-center border-2 border-[#B2FF59]/30">
                <Calendar className="size-6 text-[#B2FF59]" />
              </div>
              <div>
                <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide">Founded</div>
                <div className="text-[#FAFAFA] text-2xl font-bold font-mono">{company.founded}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#0F0F0F] rounded-lg flex items-center justify-center border-2 border-[#B2FF59]/30">
                <Users className="size-6 text-[#B2FF59]" />
              </div>
              <div>
                <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide">Employees</div>
                <div className="text-[#FAFAFA] text-2xl font-bold font-mono">{company.employees}+</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#0F0F0F] rounded-lg flex items-center justify-center border-2 border-[#B2FF59]/30">
                <Zap className="size-6 text-[#B2FF59]" />
              </div>
              <div>
                <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide">Capacity</div>
                <div className="text-[#B2FF59] text-2xl font-bold font-mono">
                  {company.capacity_gwh ? `${company.capacity_gwh} GWh` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#0F0F0F] rounded-lg flex items-center justify-center border-2 border-[#1565C0]/30">
                <DollarSign className="size-6 text-[#1565C0]" />
              </div>
              <div>
                <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide">Funding</div>
                <div className="text-[#1565C0] text-2xl font-bold font-mono">
                  {company.funding?.total_raised || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technology Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="size-6 text-[#B2FF59]" />
                <h2 className="text-[#B2FF59] text-2xl font-bold font-tech uppercase tracking-wider">
                  Technology Overview
                </h2>
              </div>
              <p className="text-[#FAFAFA] text-lg leading-relaxed">{company.technology}</p>
            </motion.div>

            {/* Development Stage */}
            {company.stage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="size-6 text-[#B2FF59]" />
                  <h2 className="text-[#B2FF59] text-2xl font-bold font-tech uppercase tracking-wider">
                    Development Stage
                  </h2>
                </div>
                <div className="bg-[#0F0F0F] p-4 rounded-lg border-2 border-[#B2FF59]/30">
                  <p className="text-[#FAFAFA] text-lg font-semibold">{company.stage}</p>
                </div>
              </motion.div>
            )}

            {/* Products */}
            {company.products && company.products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className="size-6 text-[#B2FF59]" />
                  <h2 className="text-[#B2FF59] text-2xl font-bold font-tech uppercase tracking-wider">Products</h2>
                </div>
                <div className="space-y-2">
                  {company.products.map((product, index) => (
                    <div key={index} className="bg-[#0F0F0F] p-4 rounded-lg border-2 border-[#2B2B2B]">
                      <p className="text-[#FAFAFA] font-medium">{product}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            {company.timeline && company.timeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="size-6 text-[#B2FF59]" />
                  <h2 className="text-[#B2FF59] text-2xl font-bold font-tech uppercase tracking-wider">Timeline</h2>
                </div>
                <div className="space-y-3">
                  {company.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-20 flex-shrink-0 text-[#B2FF59] font-bold font-mono text-lg">
                        {item.year}
                      </div>
                      <div className="flex-1 bg-[#0F0F0F] p-4 rounded-lg border-2 border-[#2B2B2B]">
                        <p className="text-[#FAFAFA]">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Funding Details */}
            {company.funding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="size-6 text-[#1565C0]" />
                  <h2 className="text-[#1565C0] text-xl font-bold font-tech uppercase tracking-wider">
                    Funding Details
                  </h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                      Total Raised
                    </div>
                    <div className="text-[#1565C0] text-2xl font-bold">{company.funding.total_raised}</div>
                  </div>
                  {company.funding.ipo_date && (
                    <div className="pt-3 border-t-2 border-[#2B2B2B]">
                      <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                        IPO Date
                      </div>
                      <div className="text-[#FAFAFA] font-medium">{company.funding.ipo_date}</div>
                    </div>
                  )}
                  {company.funding.ipo_method && (
                    <div>
                      <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                        IPO Method
                      </div>
                      <div className="text-[#FAFAFA] font-medium">{company.funding.ipo_method}</div>
                    </div>
                  )}
                  {company.funding.valuation && (
                    <div>
                      <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                        Valuation
                      </div>
                      <div className="text-[#FAFAFA] font-medium">{company.funding.valuation}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Partnerships */}
            {company.partnerships && company.partnerships.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="size-6 text-[#B2FF59]" />
                  <h2 className="text-[#B2FF59] text-xl font-bold font-tech uppercase tracking-wider">
                    Partnerships
                  </h2>
                </div>
                <div className="space-y-2">
                  {company.partnerships.map((partner, index) => (
                    <div key={index} className="bg-[#0F0F0F] p-3 rounded-lg border-2 border-[#2B2B2B]">
                      <p className="text-[#FAFAFA] font-medium">{partner}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Financials */}
            {company.financials && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="size-6 text-[#1565C0]" />
                  <h2 className="text-[#1565C0] text-xl font-bold font-tech uppercase tracking-wider">
                    Financials
                  </h2>
                </div>
                <div className="space-y-3">
                  {company.financials['2024_revenue'] && (
                    <div>
                      <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                        2024 Revenue
                      </div>
                      <div className="text-[#FAFAFA] text-lg font-bold">{company.financials['2024_revenue']}</div>
                    </div>
                  )}
                  {company.financials['2024_net_loss'] && (
                    <div>
                      <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                        2024 Net Loss
                      </div>
                      <div className="text-red-400 text-lg font-bold">{company.financials['2024_net_loss']}</div>
                    </div>
                  )}
                  {company.financials.cash_runway && (
                    <div>
                      <div className="text-[#888888] text-xs font-semibold uppercase tracking-wide mb-1">
                        Cash Runway
                      </div>
                      <div className="text-[#B2FF59] text-lg font-bold">{company.financials.cash_runway}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-2 px-8 py-4 bg-[#B2FF59] text-[#0A0A0A] rounded-lg hover:bg-[#A0E050] transition-all duration-300 font-bold text-lg shadow-lg shadow-[#B2FF59]/30 hover:shadow-[#B2FF59]/50"
          >
            <ArrowLeft className="size-5" />
            Back to All Companies
          </button>
        </div>
      </div>
    </div>
  );
}
