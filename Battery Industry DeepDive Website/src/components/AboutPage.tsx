import { motion } from 'motion/react';
import { Target, Database, Shield, Users, TrendingUp, CheckCircle } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Database,
    title: 'Data Transparency',
    description: 'All information sourced from public, verifiable data including government filings, academic research, and industry reports.',
  },
  {
    icon: Shield,
    title: 'Integrity First',
    description: 'No commercial bias. This platform serves as a neutral intelligence resource for researchers, policymakers, and industry professionals.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Updates',
    description: 'Continuous monitoring and updates to reflect the latest developments in the U.S. battery industry ecosystem.',
  },
  {
    icon: Users,
    title: 'Open Access',
    description: 'Free access to critical industry intelligence to promote informed decision-making and accelerate the clean energy transition.',
  },
];

const DATA_SOURCES = [
  'U.S. Department of Energy',
  'Securities and Exchange Commission (SEC)',
  'National Renewable Energy Laboratory',
  'Bloomberg New Energy Finance',
  'U.S. Geological Survey',
  'Environmental Protection Agency',
  'Industry Association Reports',
  'Academic Research Publications',
];

const METRICS = [
  { label: 'Companies Tracked', value: '240+', icon: Building2 },
  { label: 'Data Points', value: '50K+', icon: Database },
  { label: 'Monthly Updates', value: '1,200+', icon: TrendingUp },
  { label: 'Verified Sources', value: '180+', icon: CheckCircle },
];

function Building2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  );
}

export function AboutPage() {
  return (
    <div className="min-h-screen pt-24 bg-[#0A0A0A]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F0F0F] border-b-4 border-[#B2FF59] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B2FF59]/10 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[#B2FF59] mb-4 text-5xl font-extrabold font-tech uppercase tracking-wider">About Battery Industry DeepDive</h1>
            <p className="text-[#FAFAFA] max-w-2xl text-lg font-medium">
              A comprehensive, data-driven intelligence platform for understanding America's battery revolution
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1A1A1A] p-12 rounded-2xl border-2 border-[#B2FF59]/30"
        >
          <div className="flex items-start gap-8">
            <div className="p-6 bg-[#0F0F0F] rounded-xl border-2 border-[#B2FF59]/30">
              <Target className="size-12 text-[#B2FF59]" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#B2FF59] mb-4 text-3xl font-bold font-tech uppercase tracking-wider">Our Mission</h2>
              <p className="text-[#CCCCCC] leading-relaxed mb-4 text-lg">
                Battery Industry DeepDive exists to provide transparent, comprehensive, and actionable intelligence
                on the United States battery industry ecosystem. We aggregate data from public sources to create
                a unified view of companies, technologies, investments, and market trends.
              </p>
              <p className="text-[#CCCCCC] leading-relaxed text-lg">
                As the energy transition accelerates, stakeholders need reliable information to make informed
                decisions. This platform serves researchers, policymakers, investors, and industry professionals
                seeking to understand and participate in America's battery revolution.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-8 text-center">Core Principles</h2>
          <div className="grid grid-cols-2 gap-6">
            {PRINCIPLES.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-[#1E1E1E] p-6 rounded-xl border border-[#B2FF59]/20 hover:border-[#B2FF59] hover:shadow-lg hover:shadow-[#B2FF59]/10 transition-all duration-300"
                >
                  <Icon className="size-8 text-[#B2FF59] mb-4" />
                  <h3 className="text-[#FAFAFA] mb-3">{principle.title}</h3>
                  <p className="text-[#FAFAFA]/70 text-sm leading-relaxed">{principle.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#1E1E1E] p-12 rounded-2xl border border-[#B2FF59]/20"
        >
          <h2 className="text-[#B2FF59] mb-6">Methodology</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[#FAFAFA] mb-3">Data Collection</h3>
              <p className="text-[#FAFAFA]/70 leading-relaxed">
                We systematically collect data from government agencies, regulatory filings, academic institutions,
                and industry publications. All data points are cross-referenced and verified before inclusion in
                our database.
              </p>
            </div>
            <div>
              <h3 className="text-[#FAFAFA] mb-3">Analysis Framework</h3>
              <p className="text-[#FAFAFA]/70 leading-relaxed">
                Our analysis combines quantitative metrics (funding amounts, capacity figures, employment data)
                with qualitative insights (technology assessments, market trends, policy impacts) to provide
                comprehensive sector intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-[#FAFAFA] mb-3">Update Cadence</h3>
              <p className="text-[#FAFAFA]/70 leading-relaxed">
                The database is updated continuously as new information becomes available. Major updates occur
                monthly, with real-time updates for significant announcements such as funding rounds, facility
                openings, and policy changes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-6">Primary Data Sources</h2>
          <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-[#B2FF59]/20">
            <div className="grid grid-cols-2 gap-4">
              {DATA_SOURCES.map((source, index) => (
                <motion.div
                  key={source}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-[#2B2B2B] rounded-lg border border-[#B2FF59]/10"
                >
                  <CheckCircle className="size-5 text-[#B2FF59] flex-shrink-0" />
                  <span className="text-[#FAFAFA]/80">{source}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Platform Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-4 gap-6">
            {METRICS.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-[#1E1E1E] p-6 rounded-xl border border-[#B2FF59]/20"
                >
                  <Icon className="size-8 text-[#B2FF59] mb-3" />
                  <div className="text-[#FAFAFA] font-mono mb-1">{metric.value}</div>
                  <div className="text-[#FAFAFA]/70 text-sm">{metric.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#1E1E1E] p-8 rounded-2xl border border-[#1565C0]/20"
        >
          <h3 className="text-[#1565C0] mb-4">Disclaimer</h3>
          <p className="text-[#FAFAFA]/70 text-sm leading-relaxed">
            Battery Industry DeepDive is an independent intelligence platform. We do not provide investment advice,
            endorse specific companies or technologies, nor accept commercial sponsorships that could compromise
            our neutrality. All data is presented for informational purposes only. Users should conduct their own
            due diligence and consult with qualified professionals before making business or investment decisions.
          </p>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#1E1E1E] to-[#2B2B2B] p-12 rounded-2xl border border-[#B2FF59] text-center"
        >
          <h2 className="text-[#B2FF59] mb-4">Built with Transparency in Mind</h2>
          <p className="text-[#FAFAFA]/80 max-w-2xl mx-auto mb-6">
            Have questions about our methodology or want to contribute data? We welcome feedback from the community.
          </p>
          <button className="px-8 py-3 bg-[#B2FF59] text-[#1E1E1E] rounded-lg hover:bg-[#A0E050] transition-colors duration-300">
            Get in Touch
          </button>
        </motion.div>
      </div>
    </div>
  );
}