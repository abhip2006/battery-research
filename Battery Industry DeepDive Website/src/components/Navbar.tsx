import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Battery, Sun, Moon, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="max-w-full px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo and Title - Stretches across the screen */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-1 min-w-0">
            <motion.div
              animate={{
                opacity: [1, 0.7, 1],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative flex-shrink-0"
            >
              <Battery className="size-6 sm:size-7 text-[#B2FF59] fill-[#B2FF59]" />
              <motion.div
                className="absolute inset-0 bg-[#B2FF59] blur-md opacity-50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <span className="text-[#FAFAFA] tracking-tight font-bold text-sm sm:text-base md:text-lg lg:text-xl font-tech uppercase truncate">
              Battery Industry DeepDive
            </span>
          </Link>

          {/* Hamburger Menu - Far Right */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2.5 sm:p-3 rounded-lg bg-[#1A1A1A] hover:bg-[#2B2B2B] border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                aria-label="Open menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="size-6 text-[#B2FF59]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="size-6 text-[#B2FF59]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </SheetTrigger>

            {/* Menu Sheet */}
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px] bg-[#0A0A0A] border-l-2 border-[#B2FF59]/20 p-0"
            >
              <SheetHeader className="border-b-2 border-[#B2FF59]/20 p-6">
                <SheetTitle className="flex items-center gap-3 text-[#FAFAFA]">
                  <Battery className="size-6 text-[#B2FF59] fill-[#B2FF59]" />
                  <span className="font-bold font-tech uppercase text-base">
                    Menu
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Navigation Links */}
              <nav className="flex flex-col p-4 pb-24">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        relative flex items-center justify-between py-4 px-4 rounded-lg
                        transition-all duration-300 min-h-[44px]
                        ${location.pathname === item.path
                          ? 'bg-[#B2FF59]/10 text-[#B2FF59] border-2 border-[#B2FF59]'
                          : 'text-[#FAFAFA] hover:bg-[#1A1A1A] hover:text-[#B2FF59] border-2 border-transparent'
                        }
                      `}
                    >
                      <span className="font-medium text-base">{item.name}</span>
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="mobileNavIndicator"
                          className="size-2 rounded-full bg-[#B2FF59] shadow-lg shadow-[#B2FF59]/50"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* Dark Mode Toggle in Menu */}
                <div className="mt-6 pt-6 border-t-2 border-[#B2FF59]/20">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between py-4 px-4 rounded-lg bg-[#1A1A1A] hover:bg-[#2B2B2B] border-2 border-[#2B2B2B] hover:border-[#B2FF59] transition-all duration-300 min-h-[44px]"
                  >
                    <span className="font-medium text-base text-[#FAFAFA]">
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    {darkMode ? (
                      <Sun className="size-5 text-[#B2FF59]" />
                    ) : (
                      <Moon className="size-5 text-[#B2FF59]" />
                    )}
                  </button>
                </div>
              </nav>

              {/* Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t-2 border-[#B2FF59]/20">
                <p className="text-[#FAFAFA]/60 text-xs text-center font-tech">
                  Battery Industry DeepDive
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}