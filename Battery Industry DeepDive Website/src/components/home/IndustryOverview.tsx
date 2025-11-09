import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Droplet, Grid3x3, Recycle, Factory, Atom } from 'lucide-react';

const SUBSECTORS = [
  {
    id: 'solid-state',
    name: 'Solid-State',
    icon: Zap,
    count: 35,
    color: '#B2FF59',
    bg: '#1E1E1E',
    description: 'Next-generation battery technology with solid electrolytes offering higher energy density and safety.',
  },
  {
    id: 'flow',
    name: 'Flow Batteries',
    icon: Droplet,
    count: 18,
    color: '#1565C0',
    bg: '#1E1E1E',
    description: 'Scalable energy storage using liquid electrolytes, ideal for grid-scale applications.',
  },
  {
    id: 'grid',
    name: 'Grid Storage',
    icon: Grid3x3,
    count: 52,
    color: '#B2FF59',
    bg: '#1565C0',
    description: 'Large-scale battery systems for renewable energy integration and grid stabilization.',
  },
  {
    id: 'recycling',
    name: 'Recycling',
    icon: Recycle,
    count: 28,
    color: '#1565C0',
    bg: '#1E1E1E',
    description: 'Circular economy solutions for battery material recovery and reuse.',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    count: 64,
    color: '#B2FF59',
    bg: '#1E1E1E',
    description: 'Battery cell and module production facilities across the United States.',
  },
  {
    id: 'materials',
    name: 'Materials',
    icon: Atom,
    count: 41,
    color: '#1565C0',
    bg: '#1E1E1E',
    description: 'Critical minerals and advanced materials for battery production.',
  },
];

export function IndustryOverview() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle, #B2FF59 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[#B2FF59] mb-4 text-5xl font-extrabold font-tech uppercase tracking-wider">Industry Overview</h2>
          <p className="text-[#FAFAFA] text-lg max-w-2xl mx-auto font-medium">
            Six critical subsectors powering America's battery revolution
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-6">
          {SUBSECTORS.map((sector, index) => {
            const Icon = sector.icon;
            const isHovered = hoveredCard === sector.id;

            return (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(sector.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group cursor-pointer"
              >
                {/* Battery Cell Shape Container */}
                <motion.div
                  animate={{
                    backgroundColor: isHovered ? sector.color : '#1A1A1A',
                  }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-2xl border-2 transition-all duration-300 h-full relative overflow-hidden"
                  style={{
                    borderColor: isHovered ? sector.color : '#2B2B2B',
                    boxShadow: isHovered ? `0 0 40px ${sector.color}60, inset 0 0 20px ${sector.color}20` : 'none',
                  }}
                >
                  {/* Battery Charge Bar */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: sector.color }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isHovered ? 1 : 0.6 }}
                    transition={{ duration: 0.5 }}
                  />

                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      animate={{
                        color: isHovered ? '#0A0A0A' : sector.color,
                        scale: isHovered ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="size-12" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: isHovered ? 1.3 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="font-mono text-2xl font-bold"
                      style={{
                        color: isHovered ? '#0A0A0A' : sector.color,
                      }}
                    >
                      {sector.count}
                    </motion.div>
                  </div>

                  <motion.h3
                    animate={{
                      color: isHovered ? '#0A0A0A' : '#FAFAFA',
                    }}
                    transition={{ duration: 0.3 }}
                    className="mb-3 text-2xl font-bold"
                  >
                    {sector.name}
                  </motion.h3>

                  <motion.p
                    className="text-sm leading-relaxed"
                    animate={{
                      color: isHovered ? '#0A0A0A' : '#AAAAAA',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {sector.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      height: isHovered ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t overflow-hidden"
                    style={{
                      borderColor: isHovered ? 'rgba(10, 10, 10, 0.2)' : 'transparent',
                    }}
                  >
                    <button
                      className="text-sm font-semibold flex items-center gap-2"
                      style={{
                        color: isHovered ? '#0A0A0A' : sector.color,
                      }}
                    >
                      Explore sector →
                    </button>
                  </motion.div>

                  {/* Hexagonal pattern overlay */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.05 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 11.5v23L20 46 0 34.5v-23z' fill='%23000000' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px',
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}