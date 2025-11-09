# Battery Intelligence Platform - Frontend

A modern, interactive web dashboard built with Next.js 14+ for analyzing the US battery manufacturing landscape, technology evolution, and market dynamics.

## Features

- **Interactive Dashboard**: Real-time data visualization with Recharts
- **Company Directory**: Searchable, filterable directory of 100+ battery manufacturers
- **Interactive Map**: US facilities plotted by state with detailed metrics
- **Technology Analysis**: Chemistry trends, energy density evolution, and performance comparisons
- **Market Forecast**: Supply/demand projections and cost trajectories through 2030
- **Policy Explorer**: IRA timeline, requirements, and impact analysis
- **Dark Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Export Functionality**: Download data as CSV or JSON
- **TypeScript**: Full type safety and enhanced developer experience

## Tech Stack

- **Framework**: Next.js 14.1+ with App Router
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+
- **Charts**: Recharts 2.10+
- **Icons**: Lucide React
- **Theme**: next-themes
- **State**: Zustand (lightweight state management)
- **Notifications**: react-hot-toast

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── companies/          # Company directory
│   │   ├── map/                # Interactive map
│   │   ├── technology/         # Technology analysis
│   │   ├── forecast/           # Market forecast
│   │   └── policy/             # Policy explorer
│   ├── components/             # Reusable components
│   │   ├── layout/             # Layout components (Header, Footer, etc.)
│   │   ├── ui/                 # UI components (Cards, Tables, etc.)
│   │   └── charts/             # Chart components (Line, Bar, Pie)
│   ├── lib/                    # Utility functions
│   │   ├── data.ts             # Data fetching and manipulation
│   │   └── utils.ts            # Helper functions
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Core data types
│   ├── hooks/                  # Custom React hooks
│   │   └── useBatteryData.ts  # Data fetching hook
│   └── styles/                 # Global styles
│       └── globals.css         # Tailwind and custom CSS
├── public/                     # Static assets
│   └── data/                   # JSON data files
│       └── visualization-data.json
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm 9.0.0 or later

### Installation

1. **Clone the repository and navigate to the frontend directory:**

```bash
cd battery-research/frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Ensure data file is in place:**

Make sure `visualization-data.json` is located at `public/data/visualization-data.json`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The page auto-updates as you edit files.

### Building for Production

1. **Build the application:**

```bash
npm run build
```

2. **Start the production server:**

```bash
npm start
```

3. **Or export as static site:**

```bash
npm run build
# Static files will be in the .next folder
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Add any environment variables here
# NEXT_PUBLIC_API_URL=https://api.example.com
```

## Key Pages

### Home (`/`)
- Hero section with key metrics
- Cost trends visualization
- Capacity growth charts
- Top manufacturers overview
- Regional cluster highlights

### Companies (`/companies`)
- Comprehensive company directory
- Search and filter functionality
- Sortable data table
- Export to CSV/JSON
- Technology and capacity filters

### Map (`/map`)
- State-by-state capacity rankings
- Facility distribution
- Regional cluster analysis
- Interactive map (placeholder for Leaflet/Mapbox integration)

### Technology (`/technology`)
- Energy density trends
- Chemistry market share evolution
- Cycle life comparisons
- Technology-specific insights (LFP, NMC, NCA, Solid-State)

### Forecast (`/forecast`)
- Cost and capacity projections through 2030
- Supply chain gap analysis
- Market scenarios (Bull/Base/Bear)
- Investment pipeline overview

### Policy (`/policy`)
- IRA (Inflation Reduction Act) overview
- Critical mineral requirements
- Battery component thresholds
- Timeline and compliance milestones
- Impact analysis

## Data Structure

The application uses `visualization-data.json` with the following structure:

```typescript
{
  costCurve: CostCurveData[];           // Historical and projected costs
  capacityGrowth: CapacityGrowthData[]; // Manufacturing capacity timeline
  topCompanies: Company[];              // Battery manufacturers
  stateRankings: StateRanking[];        // State-level capacity data
  technologyMix: TechnologyMix;         // Chemistry market share
  energyDensity: EnergyDensityData;     // Performance metrics
  marketShare: MarketShareData;         // Historical chemistry distribution
  cycleLife: CycleLifeData;             // Durability metrics
  regionalClusters: RegionalCluster[];  // Geographic concentrations
  timeline: Timeline;                   // Industry milestones
  keyMetrics: KeyMetrics;               // Summary statistics
  metadata: Metadata;                   // Data source information
}
```

See `src/types/index.ts` for complete type definitions.

## Customization

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Update navigation in `src/components/layout/Header.tsx`

### Adding New Charts

1. Create a new component in `src/components/charts/`
2. Use Recharts components (LineChart, BarChart, PieChart, etc.)
3. Follow existing patterns for responsive design and theming

### Styling

- Use Tailwind utility classes for styling
- Custom styles in `src/styles/globals.css`
- Color scheme defined in `tailwind.config.ts`
- Dark mode handled via `next-themes`

### Data Updates

To update the dashboard data:

1. Edit `public/data/visualization-data.json`
2. Ensure schema matches TypeScript types in `src/types/index.ts`
3. Clear browser cache or restart dev server

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy with default settings

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`

### Static Export

For GitHub Pages or static hosting:

1. Update `next.config.js`:
```javascript
output: 'export',
```

2. Build:
```bash
npm run build
```

3. Deploy the `out/` directory

## Performance Optimization

- Images: Use Next.js Image component for automatic optimization
- Code Splitting: Automatic with Next.js App Router
- Caching: Client-side data caching in `src/lib/data.ts`
- Lazy Loading: Dynamic imports for heavy components
- Bundle Analysis: Run `npm run build` to see bundle sizes

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Data Not Loading

- Verify `visualization-data.json` is in `public/data/`
- Check browser console for errors
- Ensure JSON is valid (use JSONLint)

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`

### Dark Mode Issues

- Ensure `next-themes` is properly configured
- Check ThemeProvider in layout.tsx
- Clear browser localStorage

## License

This project is licensed under the MIT License.

## Acknowledgments

- Data sources: DOE, SEC filings, company press releases
- Chart library: Recharts
- Framework: Next.js
- Icons: Lucide React

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 14 and TypeScript**
