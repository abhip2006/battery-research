import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';

const DEMO_QUERIES = [
  "Who are the top U.S. solid-state battery companies?",
  "Which firms have the highest DOE funding exposure?",
  "What are 2030 battery capacity projections?",
  "Show me grid storage investment trends",
];

export function HeroSection() {
  const [currentQuery, setCurrentQuery] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isTyping) return;

    const query = DEMO_QUERIES[currentQuery];
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index <= query.length) {
        setDisplayText(query.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        setTimeout(() => {
          setCurrentQuery((prev) => (prev + 1) % DEMO_QUERIES.length);
          setDisplayText('');
          setIsTyping(true);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentQuery, isTyping]);

  // Floating particles - battery cells
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 4 + Math.random() * 3,
    delay: Math.random() * 2,
    size: Math.random() > 0.5 ? 'large' : 'small',
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
      {/* Battery Cell Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(#B2FF59 1px, transparent 1px),
              linear-gradient(90deg, #B2FF59 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Glowing Energy Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute h-px w-full bg-gradient-to-r from-transparent via-[#B2FF59] to-transparent"
          style={{ top: '20%' }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute h-px w-full bg-gradient-to-r from-transparent via-[#1565C0] to-transparent"
          style={{ top: '60%' }}
          animate={{
            x: ['100%', '-100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
        />
      </div>

      {/* Floating Battery Cell Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{ 
            left: `${particle.x}%`, 
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {particle.size === 'large' ? (
            <div className="w-3 h-6 rounded-sm bg-[#B2FF59] opacity-40" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#B2FF59] opacity-40" />
          )}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h1 className="text-[#B2FF59] mb-6 tracking-tight text-6xl font-extrabold font-tech uppercase">
            Battery Industry DeepDive
          </h1>
          <p className="text-[#FAFAFA] text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Explore the full landscape of America's battery revolution — data, finance, and technology, in one place.
          </p>
        </motion.div>

        {/* Chatbot Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 mb-8"
        >
          <div className="bg-[#1A1A1A] rounded-3xl p-8 shadow-2xl border-2 border-[#B2FF59]/30 relative backdrop-blur-sm">
            {/* Glow effect */}
            <motion.div
              animate={{
                opacity: isFocused ? [0.2, 0.4, 0.2] : 0.1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl bg-[#B2FF59] blur-2xl -z-10"
            />

            {/* Battery Charge Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-6 rounded-sm bg-[#B2FF59]"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
              <span className="text-[#B2FF59] text-sm font-mono">SYSTEM ACTIVE</span>
              <Sparkles className="size-4 text-[#B2FF59] ml-auto" />
            </div>

            {/* Input Area */}
            <div
              className={`flex gap-3 p-5 bg-[#0A0A0A] rounded-2xl border-2 transition-all duration-300 ${
                isFocused ? 'border-[#B2FF59] shadow-lg shadow-[#B2FF59]/20' : 'border-[#2B2B2B]'
              }`}
            >
              <input
                type="text"
                placeholder={displayText || "Ask anything about the U.S. battery industry..."}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 bg-transparent text-[#FAFAFA] text-lg outline-none placeholder:text-[#666666]"
              />
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-[#B2FF59] text-lg"
              >
                |
              </motion.span>
              <button className="p-3 bg-[#B2FF59] rounded-xl hover:bg-[#A0E050] transition-colors duration-300 shadow-lg shadow-[#B2FF59]/30">
                <Send className="size-5 text-[#0A0A0A]" />
              </button>
            </div>

            {/* Example Queries */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {['Solid-State Leaders', 'DOE Funding', 'Market Projections', 'Investment Flows'].map((tag) => (
                <button
                  key={tag}
                  className="px-5 py-2.5 bg-[#0A0A0A] text-[#FAFAFA] border border-[#2B2B2B] rounded-xl hover:bg-[#B2FF59] hover:text-[#0A0A0A] hover:border-[#B2FF59] transition-all duration-300"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <button className="px-8 py-4 bg-[#B2FF59] text-[#0A0A0A] rounded-xl hover:bg-[#A0E050] transition-all duration-300 shadow-lg shadow-[#B2FF59]/30 font-semibold">
            Explore Companies
          </button>
          <button className="px-8 py-4 bg-transparent text-[#FAFAFA] rounded-xl ring-2 ring-[#FAFAFA]/30 hover:ring-[#B2FF59] hover:text-[#B2FF59] transition-all duration-300 font-semibold">
            View Market Trends
          </button>
          <button className="px-8 py-4 bg-[#1565C0] text-[#FAFAFA] rounded-xl hover:bg-[#1976D2] transition-all duration-300 shadow-lg shadow-[#1565C0]/30 font-semibold">
            Ask a Question
          </button>
        </motion.div>
      </div>
    </section>
  );
}