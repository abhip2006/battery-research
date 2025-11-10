import { motion } from 'motion/react';
import { FileText, Download, Calendar, ExternalLink, Tag } from 'lucide-react';

const REPORTS = [
  {
    id: 1,
    title: 'U.S. Battery Manufacturing Capacity: 2024 Assessment',
    source: 'Department of Energy',
    date: 'October 2024',
    category: 'Manufacturing',
    pages: 68,
    downloads: 12400,
    summary: `This comprehensive report analyzes the current state of domestic battery production capabilities, 
    including detailed facility locations, production volumes, and supply chain integration metrics. Key findings 
    include a 40% year-over-year capacity growth and emerging solid-state technology developments.`,
    keyFindings: [
      'Total domestic capacity reached 180 GWh in 2024',
      '24 new manufacturing facilities under construction',
      'Solid-state pilot lines represent 8% of new capacity',
      'Supply chain localization increased to 35%',
    ],
    tags: ['Manufacturing', 'Capacity', 'DOE', 'Supply Chain'],
  },
  {
    id: 2,
    title: 'Critical Minerals Supply Chain Risk Analysis',
    source: 'USGS',
    date: 'September 2024',
    category: 'Materials',
    pages: 92,
    downloads: 8700,
    summary: `Comprehensive evaluation of lithium, cobalt, and nickel supply dependencies with strategic 
    recommendations for domestic sourcing and recycling infrastructure. Identifies key vulnerabilities in 
    current supply chains and proposes mitigation strategies.`,
    keyFindings: [
      'U.S. import dependence on critical minerals exceeds 80%',
      'Lithium recycling could meet 25% of demand by 2030',
      'Domestic mining projects face 5-7 year permitting timelines',
      'Strategic reserves recommended for cobalt and nickel',
    ],
    tags: ['Materials', 'Supply Chain', 'Risk', 'Recycling'],
  },
  {
    id: 3,
    title: 'Solid-State Battery Technology Roadmap',
    source: 'National Renewable Energy Laboratory',
    date: 'August 2024',
    category: 'Technology',
    pages: 115,
    downloads: 15200,
    summary: `Technical assessment of solid-state battery commercialization timelines, key technical challenges, 
    and breakthrough opportunities. Projects commercial viability by 2027-2029 for automotive applications with 
    specific milestones for manufacturing scale-up.`,
    keyFindings: [
      'Ceramic electrolytes showing 95%+ cycle stability',
      'Manufacturing costs expected to reach parity by 2028',
      'Energy density targets of 400 Wh/kg achievable',
      '6 U.S. companies in advanced prototype phase',
    ],
    tags: ['Technology', 'R&D', 'Solid-State', 'Innovation'],
  },
  {
    id: 4,
    title: 'Grid-Scale Energy Storage Economics: 2024-2030',
    source: 'BloombergNEF',
    date: 'July 2024',
    category: 'Economics',
    pages: 78,
    downloads: 10500,
    summary: `Cost trajectory analysis for utility-scale battery storage systems. Documents 60% cost reduction 
    since 2020 and projects continued decline through 2030, enabling broader renewable integration and grid 
    modernization at scale.`,
    keyFindings: [
      'System costs declined to $250/kWh in 2024',
      'Long-duration storage gap identified beyond 8 hours',
      'Iron-air and flow batteries gaining market share',
      'Policy incentives driving 34% annual deployment growth',
    ],
    tags: ['Grid Storage', 'Economics', 'Forecast', 'Policy'],
  },
  {
    id: 5,
    title: 'Battery Recycling Infrastructure Development Plan',
    source: 'EPA & DOE',
    date: 'June 2024',
    category: 'Recycling',
    pages: 85,
    downloads: 7300,
    summary: `Strategic framework for building circular economy infrastructure for end-of-life batteries. 
    Outlines regulatory requirements, optimal facility locations, material recovery targets through 2030, 
    and economic incentive structures.`,
    keyFindings: [
      '18 new recycling facilities planned by 2028',
      '92% recovery rate for lithium achieved in pilot programs',
      'Recycled material cost competitive by 2026',
      'Federal funding allocated: $2.1B for infrastructure',
    ],
    tags: ['Recycling', 'Circular Economy', 'Policy', 'Infrastructure'],
  },
  {
    id: 6,
    title: 'Workforce Development for Battery Industry',
    source: 'Department of Labor',
    date: 'May 2024',
    category: 'Workforce',
    pages: 62,
    downloads: 5800,
    summary: `Analysis of workforce needs for the expanding U.S. battery industry. Identifies skill gaps, 
    training requirements, and recommendations for education partnerships to support industry growth through 2030.`,
    keyFindings: [
      '80,000 new jobs projected by 2030',
      'Skills gap in battery chemistry and manufacturing',
      '42 community college programs launched',
      'Average salary premium: 18% above manufacturing baseline',
    ],
    tags: ['Workforce', 'Training', 'Jobs', 'Education'],
  },
];

const CATEGORIES = ['All', 'Manufacturing', 'Materials', 'Technology', 'Economics', 'Recycling', 'Workforce'];

export function ReportsPage() {
  return (
    <div className="min-h-screen pt-20 sm:pt-24 bg-[#0A0A0A]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F0F0F] border-b-4 border-[#B2FF59] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B2FF59]/10 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[#B2FF59] mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Research Reports</h1>
            <p className="text-[#FAFAFA] max-w-2xl text-base sm:text-lg font-medium">
              In-depth analysis from government agencies, research institutions, and industry analysts
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12"
        >
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#1E1E1E] text-[#FAFAFA]/70 rounded-lg hover:bg-[#B2FF59] hover:text-[#1E1E1E] transition-all duration-300 text-sm sm:text-base"
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Reports Grid */}
        <div className="space-y-4 sm:space-y-6">
          {REPORTS.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-[#1E1E1E] rounded-2xl border border-[#B2FF59]/20 overflow-hidden hover:border-[#B2FF59] hover:shadow-lg hover:shadow-[#B2FF59]/10 transition-all duration-300 group"
            >
              <div className="p-4 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-[#2B2B2B] rounded-xl border border-[#B2FF59]/20 group-hover:border-[#B2FF59] transition-all duration-300">
                    <FileText className="size-6 sm:size-8 text-[#B2FF59]" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                      <div className="flex-1">
                        <h3 className="text-[#FAFAFA] mb-2 text-base sm:text-lg group-hover:text-[#B2FF59] transition-colors duration-300">
                          {report.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#FAFAFA]/60">
                          <span className="flex items-center gap-1">
                            <ExternalLink className="size-3" />
                            {report.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {report.date}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-[#B2FF59]/20 text-[#B2FF59] rounded text-xs sm:text-sm self-start">
                        {report.category}
                      </span>
                    </div>
                    <p className="text-[#FAFAFA]/70 text-sm leading-relaxed">{report.summary}</p>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-[#2B2B2B] rounded-xl border border-[#B2FF59]/10">
                  <h4 className="text-[#B2FF59] mb-3 text-sm sm:text-base font-semibold">Key Findings</h4>
                  <ul className="space-y-2">
                    {report.keyFindings.map((finding, i) => (
                      <li key={i} className="text-[#FAFAFA]/80 text-xs sm:text-sm flex items-start gap-2">
                        <span className="text-[#B2FF59] mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {report.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#2B2B2B] text-[#B2FF59] text-xs rounded border border-[#B2FF59]/30 flex items-center gap-1"
                      >
                        <Tag className="size-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className="text-xs sm:text-sm text-[#FAFAFA]/60">
                      {report.pages} pages • {report.downloads.toLocaleString()} downloads
                    </div>
                    <button className="px-4 py-2.5 sm:py-2 bg-[#B2FF59] text-[#1E1E1E] rounded-lg hover:bg-[#A0E050] transition-colors duration-300 text-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                      <Download className="size-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#B2FF59]/20">
            <FileText className="size-6 sm:size-8 text-[#B2FF59] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">150+</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Total Reports</div>
          </div>
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#1565C0]/20">
            <Download className="size-6 sm:size-8 text-[#1565C0] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">245K</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Total Downloads</div>
          </div>
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#B2FF59]/20">
            <ExternalLink className="size-6 sm:size-8 text-[#B2FF59] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">42</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Source Organizations</div>
          </div>
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#1565C0]/20">
            <Calendar className="size-6 sm:size-8 text-[#1565C0] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">2024</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Latest Updates</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}