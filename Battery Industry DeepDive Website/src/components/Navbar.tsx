import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Battery, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Companies', path: '/companies' },
    { name: 'Subsectors', path: '/subsectors' },
    { name: 'Investments', path: '/investments' },
    { name: 'Reports', path: '/reports' },
    { name: 'Forecasts', path: '/forecasts' },
    { name: 'About', path: '/about' },
  ];

  return (
    <motion.nav
      initial={{ backgroundColor: 'rgba(10, 10, 10, 0)' }}
      animate={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0)',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[#B2FF59]/20"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              animate={{ 
                opacity: [1, 0.7, 1],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <Battery className="size-7 text-[#B2FF59] fill-[#B2FF59]" />
              <motion.div
                className="absolute inset-0 bg-[#B2FF59] blur-md opacity-50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <span className="text-[#FAFAFA] tracking-tight font-bold text-lg font-tech uppercase">
              Battery Industry DeepDive
            </span>
          </Link>

          {/* Center Menu */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-[#FAFAFA] hover:text-[#B2FF59] transition-colors duration-300 font-medium"
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#B2FF59] shadow-lg shadow-[#B2FF59]/50"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2B2B2B] border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300"
          >
            {darkMode ? (
              <Sun className="size-5 text-[#B2FF59]" />
            ) : (
              <Moon className="size-5 text-[#B2FF59]" />
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}