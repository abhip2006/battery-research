import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar, ExternalLink, X } from 'lucide-react';

const REPORTS = [
  {
    id: 1,
    title: 'U.S. Battery Manufacturing Capacity: 2024 Assessment',
    source: 'Department of Energy',
    date: 'October 2024',
    summary:
      'Comprehensive analysis of domestic battery production capabilities, including facility locations, production volumes, and supply chain integration. Highlights include 40% YoY capacity growth and emerging solid-state technologies.',
    tags: ['Manufacturing', 'Capacity', 'DOE'],
  },
  {
    id: 2,
    title: 'Critical Minerals Supply Chain Risk Analysis',
    source: 'USGS',
    date: 'September 2024',
    summary:
      'Evaluation of lithium, cobalt, and nickel supply dependencies with strategic recommendations for domestic sourcing and recycling infrastructure. Identifies vulnerabilities in current supply chains.',
    tags: ['Materials', 'Supply Chain', 'Risk'],
  },
  {
    id: 3,
    title: 'Solid-State Battery Technology Roadmap',
    source: 'National Renewable Energy Laboratory',
    date: 'August 2024',
    summary:
      'Technical assessment of solid-state battery commercialization timelines, key challenges, and breakthrough opportunities. Projects commercial viability by 2027-2029 for automotive applications.',
    tags: ['Technology', 'R&D', 'Solid-State'],
  },
  {
    id: 4,
    title: 'Grid-Scale Energy Storage Economics: 2024-2030',
    source: 'BloombergNEF',
    date: 'July 2024',
    summary:
      'Cost trajectory analysis for utility-scale battery storage systems. Documents 60% cost reduction since 2020 and projects continued decline through 2030, enabling broader renewable integration.',
    tags: ['Grid Storage', 'Economics', 'Forecast'],
  },
  {
    id: 5,
    title: 'Battery Recycling Infrastructure Development Plan',
    source: 'EPA & DOE',
    date: 'June 2024',
    summary:
      'Strategic framework for building circular economy infrastructure for end-of-life batteries. Outlines regulatory requirements, facility locations, and material recovery targets through 2030.',
    tags: ['Recycling', 'Circular Economy', 'Policy'],
  },
];

export function ReportsSection() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-[#2B2B2B]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-[#B2FF59] mb-3 md:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Policy & Research Reports</h2>
          <p className="text-[#FAFAFA]/70 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Latest intelligence from government agencies, research institutions, and industry analysts
          </p>
        </motion.div>

        <div className="space-y-3 md:space-y-4">
          {REPORTS.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div
                onClick={() => setSelectedReport(report.id)}
                className="bg-[#1E1E1E] p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border border-[#B2FF59]/20 hover:border-[#B2FF59] cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-[#B2FF59]/10"
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                  <div className="flex-1 w-full">
                    <div className="flex items-start gap-3 sm:gap-4 mb-3">
                      <FileText className="size-5 sm:size-6 text-[#B2FF59] flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#FAFAFA] text-base sm:text-lg mb-2 group-hover:text-[#B2FF59] transition-colors duration-300">
                          {report.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#FAFAFA]/60">
                          <span className="flex items-center gap-1">
                            <ExternalLink className="size-3 flex-shrink-0" />
                            <span className="truncate">{report.source}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 flex-shrink-0" />
                            {report.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {report.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#2B2B2B] text-[#B2FF59] text-xs rounded border border-[#B2FF59]/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="md:hidden w-full mt-2 px-4 py-2 bg-[#B2FF59]/10 text-[#B2FF59] rounded-lg text-sm font-semibold min-h-[44px]">
                    View Summary →
                  </button>
                  <button className="hidden md:block text-[#B2FF59] text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    View Summary →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedReport && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[90vw] md:w-[600px] max-w-full bg-[#1E1E1E] z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <FileText className="size-6 sm:size-8 text-[#B2FF59]" />
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-[#2B2B2B] rounded-lg transition-colors duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X className="size-5 sm:size-6 text-[#FAFAFA]" />
                  </button>
                </div>

                {/* Content */}
                {REPORTS.filter((r) => r.id === selectedReport).map((report) => (
                  <div key={report.id} className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-[#FAFAFA] text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-bold">{report.title}</h2>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#FAFAFA]/60 mb-3 sm:mb-4">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="size-3" />
                          {report.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {report.date}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 sm:px-3 py-1 bg-[#B2FF59]/20 text-[#B2FF59] text-xs sm:text-sm rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-[#B2FF59]/20" />

                    <div>
                      <h3 className="text-[#B2FF59] mb-2 sm:mb-3 text-base sm:text-lg font-bold">Key Insights</h3>
                      <p className="text-[#FAFAFA]/80 leading-relaxed text-sm sm:text-base">{report.summary}</p>
                    </div>

                    <div className="bg-[#2B2B2B] p-4 sm:p-6 rounded-lg md:rounded-xl border border-[#B2FF59]/20">
                      <h4 className="text-[#B2FF59] mb-3 text-base sm:text-lg font-bold">Report Statistics</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#FAFAFA]/60">Pages</span>
                          <span className="text-[#FAFAFA] font-mono">
                            {Math.floor(Math.random() * 50) + 30}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAFAFA]/60">Citations</span>
                          <span className="text-[#FAFAFA] font-mono">
                            {Math.floor(Math.random() * 100) + 50}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAFAFA]/60">Data Points</span>
                          <span className="text-[#FAFAFA] font-mono">
                            {Math.floor(Math.random() * 500) + 200}+
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full px-6 py-3 bg-[#B2FF59] text-[#1E1E1E] rounded-lg hover:bg-[#A0E050] transition-colors duration-300 font-semibold text-sm sm:text-base min-h-[44px]">
                      Download Full Report
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
