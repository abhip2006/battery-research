'use client';

import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';

const footerLinks = {
  pages: [
    { name: 'Home', href: '/' },
    { name: 'Companies', href: '/companies' },
    { name: 'Interactive Map', href: '/map' },
    { name: 'Technology', href: '/technology' },
  ],
  resources: [
    { name: 'Forecast Dashboard', href: '/forecast' },
    { name: 'Policy Explorer', href: '/policy' },
    { name: 'Data Sources', href: '/about#sources' },
    { name: 'Methodology', href: '/about#methodology' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Battery Intelligence Platform
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive research platform analyzing the US battery manufacturing
              landscape, technology evolution, and market dynamics. Data compiled from
              industry reports, government sources, and verified company announcements.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Pages
            </h4>
            <ul className="space-y-2">
              {footerLinks.pages.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} Battery Intelligence Platform. All data verified and
              sourced from public records.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              For research and informational purposes only. Capacity figures represent
              announced plans and may be subject to change.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
