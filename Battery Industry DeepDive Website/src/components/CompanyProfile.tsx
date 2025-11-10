import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Award,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Clock,
  Package,
  Target,
  Handshake,
} from 'lucide-react';
import { getCompanyById, type Company } from '../services/companies.service';

export function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      if (!id) {
        setError('No company ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const companyData = await getCompanyById(parseInt(id));
        if (!companyData) {
          setError('Company not found');
        } else {
          setCompany(companyData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [id]);

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
            className="px-6 py-3 bg-[#B2FF59] text-[#0A0A0A] rounded-lg hover:bg-[#A0E050] transition-colors min-h-[44px]"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const isPublic = company.ticker || company.is_publicly_traded;

  return (
    <div className="min-h-screen pt-16 md:pt-24 bg-[#0A0A0A]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-[#B2FF59] hover:text-[#A0E050] transition-colors font-medium"
        >
          <ArrowLeft className="size-5" />
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
          >
            <div className="flex items-start gap-4 md:gap-6 mb-6">
              {/* Company Logo/Icon */}
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1A1A1A] rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-[#B2FF59]">
                <Building2 className="size-8 md:size-12 text-[#B2FF59]" />
              </div>

              {/* Company Header Info */}
              <div className="flex-1">
                <h1 className="text-[#B2FF59] mb-2 text-2xl md:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">
                  {company.name}
                  {company.ticker && (
                    <span className="ml-3 text-lg md:text-2xl text-[#FAFAFA]">
                      ({company.ticker})
                    </span>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                  <span className="px-3 py-1.5 bg-[#B2FF59]/20 text-[#B2FF59] rounded-lg font-semibold border border-[#B2FF59]/50 text-xs md:text-sm">
                    {company.technology}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg font-semibold border text-xs md:text-sm ${
                      isPublic
                        ? 'bg-[#B2FF59]/20 text-[#B2FF59] border-[#B2FF59]/50'
                        : 'bg-[#1565C0]/20 text-[#1565C0] border-[#1565C0]/50'
                    }`}
                  >
                    {isPublic ? 'Public' : 'Private'}
                    {company.exchange && ` • ${company.exchange}`}
                  </span>
                  <span className="px-3 py-1.5 bg-[#2B2B2B] text-[#FAFAFA] rounded-lg font-semibold text-xs md:text-sm">
                    {company.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#CCCCCC] text-sm md:text-base">
                  <MapPin className="size-4 md:size-5 text-[#B2FF59]" />
                  <span>{company.headquarters}</span>
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-[#B2FF59] hover:text-[#A0E050] transition-colors text-sm md:text-base"
                  >
                    Visit Website <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Key Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-xl border-2 border-[#B2FF59]/30">
            <div className="flex items-center gap-2 mb-2 text-[#888888]">
              <Calendar className="size-4 md:size-5" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Founded</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#FAFAFA]">{company.founded}</div>
          </div>

          <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-xl border-2 border-[#B2FF59]/30">
            <div className="flex items-center gap-2 mb-2 text-[#888888]">
              <Users className="size-4 md:size-5" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Employees</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#FAFAFA]">{company.employees}+</div>
          </div>

          <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-xl border-2 border-[#B2FF59]/30">
            <div className="flex items-center gap-2 mb-2 text-[#888888]">
              <Zap className="size-4 md:size-5" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Capacity</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#B2FF59]">
              {company.capacity_gwh ? `${company.capacity_gwh} GWh` : 'N/A'}
            </div>
            {company.capacity_target_year && (
              <div className="text-xs text-[#AAAAAA] mt-1">Target: {company.capacity_target_year}</div>
            )}
          </div>

          <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-xl border-2 border-[#B2FF59]/30">
            <div className="flex items-center gap-2 mb-2 text-[#888888]">
              <DollarSign className="size-4 md:size-5" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Funding</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#1565C0]">
              {company.funding?.total_raised || 'N/A'}
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Funding Details */}
            {company.funding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="size-6 md:size-7" />
                  Funding Information
                </h2>
                <div className="space-y-4">
                  {company.funding.total_raised && (
                    <div>
                      <div className="text-[#888888] text-sm mb-1">Total Raised</div>
                      <div className="text-[#FAFAFA] text-lg font-semibold">{company.funding.total_raised}</div>
                    </div>
                  )}
                  {company.funding.ipo_date && (
                    <div>
                      <div className="text-[#888888] text-sm mb-1">IPO Date</div>
                      <div className="text-[#FAFAFA] text-lg font-semibold">{company.funding.ipo_date}</div>
                    </div>
                  )}
                  {company.funding.ipo_method && (
                    <div>
                      <div className="text-[#888888] text-sm mb-1">IPO Method</div>
                      <div className="text-[#FAFAFA] text-lg font-semibold">{company.funding.ipo_method}</div>
                    </div>
                  )}
                  {company.funding.valuation && (
                    <div>
                      <div className="text-[#888888] text-sm mb-1">Valuation</div>
                      <div className="text-[#FAFAFA] text-lg font-semibold">{company.funding.valuation}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Financials */}
            {company.financials && Object.keys(company.financials).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="size-6 md:size-7" />
                  Financial Highlights
                </h2>
                <div className="space-y-4">
                  {Object.entries(company.financials).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[#888888] text-sm mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-[#FAFAFA] text-lg font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Partnerships */}
            {company.partnerships && company.partnerships.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <Handshake className="size-6 md:size-7" />
                  Key Partnerships
                </h2>
                <div className="space-y-3">
                  {company.partnerships.map((partnership, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-[#FAFAFA] bg-[#0F0F0F] p-3 rounded-lg"
                    >
                      <Award className="size-5 text-[#B2FF59] flex-shrink-0" />
                      <span>{partnership}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Products */}
            {company.products && company.products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <Package className="size-6 md:size-7" />
                  Products
                </h2>
                <ul className="space-y-3">
                  {company.products.map((product, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#FAFAFA]">
                      <span className="text-[#B2FF59] mt-1.5">•</span>
                      <span>{product}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Features */}
            {company.features && company.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <Zap className="size-6 md:size-7" />
                  Key Features
                </h2>
                <ul className="space-y-3">
                  {company.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#FAFAFA]">
                      <span className="text-[#B2FF59] mt-1.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Applications */}
            {company.applications && company.applications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <Target className="size-6 md:size-7" />
                  Applications
                </h2>
                <ul className="space-y-3">
                  {company.applications.map((application, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#FAFAFA]">
                      <span className="text-[#B2FF59] mt-1.5">•</span>
                      <span>{application}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Timeline */}
            {company.timeline && company.timeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-[#1A1A1A] p-6 md:p-8 rounded-xl border-2 border-[#B2FF59]/30"
              >
                <h2 className="text-[#B2FF59] mb-4 md:mb-6 text-xl md:text-2xl font-bold font-tech uppercase tracking-wider flex items-center gap-2">
                  <Clock className="size-6 md:size-7" />
                  Company Timeline
                </h2>
                <div className="space-y-4">
                  {company.timeline
                    .sort((a, b) => b.year - a.year)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-[#2B2B2B] last:border-b-0 last:pb-0"
                      >
                        <div className="text-[#B2FF59] font-bold text-lg flex-shrink-0">{item.year}</div>
                        <div className="text-[#FAFAFA]">{item.event}</div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Confidence Score */}
        {company.confidence_score && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#B2FF59]/30 text-center"
          >
            <div className="text-[#888888] text-sm mb-2">Data Confidence Score</div>
            <div className="text-3xl font-bold text-[#B2FF59]">
              {(company.confidence_score * 100).toFixed(0)}%
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
