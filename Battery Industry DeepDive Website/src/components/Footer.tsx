import { Battery } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t-4 border-[#B2FF59] relative">
      {/* Energy Bar Animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A] overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-[#B2FF59] to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-12">
          {/* Left: Logo + Brief */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Battery className="size-7 text-[#B2FF59] fill-[#B2FF59]" />
              <span className="text-[#FAFAFA] font-bold text-lg font-tech uppercase">Battery Industry DeepDive</span>
            </div>
            <p className="text-[#AAAAAA] leading-relaxed font-medium">
              A full-spectrum view of America's battery future
            </p>
          </div>

          {/* Middle: Quick Links */}
          <div>
            <h3 className="text-[#B2FF59] mb-4 font-bold font-tech uppercase tracking-wider">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/companies" className="text-[#AAAAAA] hover:text-[#B2FF59] transition-colors duration-300">
                Companies
              </Link>
              <Link to="/subsectors" className="text-[#AAAAAA] hover:text-[#B2FF59] transition-colors duration-300">
                Subsectors
              </Link>
              <Link to="/investments" className="text-[#AAAAAA] hover:text-[#B2FF59] transition-colors duration-300">
                Investments
              </Link>
              <Link to="/forecasts" className="text-[#AAAAAA] hover:text-[#B2FF59] transition-colors duration-300">
                Forecasts
              </Link>
            </div>
          </div>

          {/* Right: Citation Disclaimer */}
          <div>
            <h3 className="text-[#B2FF59] mb-4 font-bold">Data Integrity</h3>
            <p className="text-[#AAAAAA] leading-relaxed">
              All information sourced from public, verifiable data. Built with transparency and data integrity in mind.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}