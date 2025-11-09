# Battery Intelligence Platform - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Next.js App Router                        │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              Root Layout (layout.tsx)                 │  │ │
│  │  │  • ThemeProvider (Dark Mode)                         │  │ │
│  │  │  • Header (Navigation)                               │  │ │
│  │  │  • Main Content (Pages)                              │  │ │
│  │  │  • Footer                                            │  │ │
│  │  │  • Toast Notifications                               │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Page Components                          │
├─────────────────────────────────────────────────────────────────┤
│  Home        │ Companies  │ Map        │ Technology             │
│  /           │ /companies │ /map       │ /technology            │
│              │            │            │                        │
│  Forecast    │ Policy                                           │
│  /forecast   │ /policy                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Custom Hooks Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  useBatteryData()                                                │
│  • Fetches data from static JSON                                │
│  • Manages loading/error states                                 │
│  • Returns typed data                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer (lib/)                           │
├─────────────────────────────────────────────────────────────────┤
│  data.ts                    │ utils.ts                           │
│  • fetchBatteryData()       │ • formatNumber()                   │
│  • filterCompanies()        │ • formatCurrency()                 │
│  • sortCompanies()          │ • getTechnologyColor()             │
│  • exportToCSV()            │ • debounce()                       │
│  • exportToJSON()           │ • copyToClipboard()                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Static Data Source                             │
│        public/data/visualization-data.json                       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── ThemeProvider
│   └── RootLayout
│       ├── Header
│       │   ├── Logo/Brand
│       │   ├── Desktop Navigation
│       │   ├── Mobile Menu Button
│       │   └── ThemeToggle
│       │
│       ├── Main Content (Page)
│       │   │
│       │   ├── Home Page (/)
│       │   │   ├── Hero Section
│       │   │   ├── MetricCard × 4
│       │   │   ├── LineChart (Cost Trends)
│       │   │   ├── BarChart (Capacity)
│       │   │   ├── BarChart (Companies)
│       │   │   └── Regional Clusters Grid
│       │   │
│       │   ├── Companies Page (/companies)
│       │   │   ├── SearchBar
│       │   │   ├── FilterPanel
│       │   │   │   ├── CheckboxFilter (Technology)
│       │   │   │   └── RangeFilter (Capacity)
│       │   │   └── Table
│       │   │       ├── TableHeader
│       │   │       └── TableBody
│       │   │           └── TableRow × N
│       │   │
│       │   ├── Technology Page (/technology)
│       │   │   ├── Card × Multiple
│       │   │   │   ├── LineChart (Energy Density)
│       │   │   │   ├── PieChart (Market Share)
│       │   │   │   ├── BarChart (Tech Mix)
│       │   │   │   └── BarChart (Cycle Life)
│       │   │   └── Insight Cards
│       │   │
│       │   ├── Map Page (/map)
│       │   │   ├── Map Placeholder
│       │   │   ├── State Ranking Cards Grid
│       │   │   └── Regional Cluster Cards
│       │   │
│       │   ├── Forecast Page (/forecast)
│       │   │   ├── MetricCard × 4
│       │   │   ├── LineChart (Dual Axis)
│       │   │   ├── Supply Chain Cards
│       │   │   └── Scenario Cards (Bull/Base/Bear)
│       │   │
│       │   └── Policy Page (/policy)
│       │       ├── IRA Overview Card
│       │       ├── Requirements Cards
│       │       ├── Impact Analysis Grid
│       │       └── Timeline
│       │
│       ├── Footer
│       │   ├── Brand Section
│       │   ├── Links Grid
│       │   └── Copyright
│       │
│       └── Toaster (Notifications)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Initial Page Load                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               useBatteryData() Hook Triggered                    │
│                   (in page component)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Set Loading State (loading = true)                  │
│              Display <Loading /> Component                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            fetchBatteryData() Called (lib/data.ts)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌───────────────────┐  ┌──────────────────┐
        │  Cache Hit?       │  │  Cache Miss?     │
        │  Return Cached    │  │  Fetch from JSON │
        └───────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Data Received & Type-Checked                        │
│              (TypeScript ensures schema match)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│             Update Component State                               │
│             • data = batteryData                                 │
│             • loading = false                                    │
│             • error = null                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            React Re-renders with Data                            │
│            • Charts receive data props                           │
│            • Tables populated                                    │
│            • Metrics calculated                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              User Interactions                                   │
├─────────────────────────────────────────────────────────────────┤
│  Search     → Filter data → Re-render table                     │
│  Filter     → Apply filters → Update results                    │
│  Sort       → Sort data → Re-render table                       │
│  Export     → Generate file → Download                          │
│  Dark Mode  → Toggle theme → Update CSS variables              │
└─────────────────────────────────────────────────────────────────┘
```

## State Management

### Component-Level State (useState)
```typescript
// Page-specific filters, search, UI state
const [searchQuery, setSearchQuery] = useState('');
const [selectedTech, setSelectedTech] = useState<string[]>([]);
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
```

### Custom Hook State (useBatteryData)
```typescript
// Global data fetching and caching
const [data, setData] = useState<BatteryData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
```

### Context-Based State (next-themes)
```typescript
// Dark mode preference
const { theme, setTheme } = useTheme();
// Values: 'light' | 'dark' | 'system'
```

## Routing Architecture

```
/                           → Home Page (Overview Dashboard)
/companies                  → Company Directory (Search & Filter)
/companies/[slug]           → [Future] Individual Company Page
/map                        → Interactive Map & State Rankings
/technology                 → Technology Analysis & Comparisons
/forecast                   → Market Forecasts & Projections
/policy                     → Policy Explorer (IRA Analysis)
/about                      → [Future] About & Methodology
/api/*                      → [Future] API Routes
```

## Styling Architecture

### Tailwind Utility Classes
```css
/* Direct utility usage */
className="px-4 py-2 bg-primary-600 text-white rounded-lg"
```

### Component Classes (globals.css)
```css
/* Reusable component classes */
.card { @apply bg-white dark:bg-gray-800 rounded-lg shadow-md ... }
.btn { @apply px-4 py-2 rounded-lg font-medium ... }
.btn-primary { @apply bg-primary-600 text-white ... }
```

### CSS Variables (Theme)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  ...
}
```

## Type System Architecture

```typescript
// Core Data Types (types/index.ts)
interface BatteryData {
  costCurve: CostCurveData[];
  capacityGrowth: CapacityGrowthData[];
  topCompanies: Company[];
  // ... all data structures
}

// Component Props
interface ChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  // ... configuration
}

// Hook Returns
function useBatteryData(): {
  data: BatteryData | null;
  loading: boolean;
  error: Error | null;
}
```

## Performance Optimizations

### 1. Code Splitting (Automatic)
```
Page chunks:
├── page.js (Home)           ~45 KB
├── companies/page.js        ~38 KB
├── technology/page.js       ~42 KB
└── ... (per route)
```

### 2. Component Optimization
```typescript
// Memoization for expensive calculations
const filtered = useMemo(() =>
  filterCompanies(data, filters),
  [data, filters]
);

// Debounced search
const debouncedSearch = debounce(setQuery, 300);
```

### 3. Asset Optimization
- SVG icons (Lucide) - tree-shakable
- No images yet - ready for next/image
- Lazy-loaded charts (client components)

## Security Architecture

### Client-Side Security
```typescript
// XSS Protection (React default)
{company.name} // Auto-escaped

// No eval() or dangerouslySetInnerHTML
// Environment variables properly scoped
// NEXT_PUBLIC_ prefix for client exposure
```

### Future API Security
```typescript
// Ready for implementation
- JWT authentication
- CORS configuration
- Rate limiting
- Input validation
```

## Error Handling

```typescript
// Component-level error boundaries
if (error) {
  return <ErrorComponent message={error.message} />;
}

// Hook-level error catching
try {
  const data = await fetchBatteryData();
  setData(data);
} catch (err) {
  setError(err as Error);
  toast.error('Failed to load data');
}
```

## Accessibility Features

### Semantic HTML
```html
<nav>, <main>, <article>, <section>, <header>, <footer>
```

### ARIA Labels
```typescript
<button aria-label="Toggle dark mode">
<input aria-label="Search companies">
<canvas role="img" aria-label="Battery cost trends">
```

### Keyboard Navigation
- Tab order follows visual order
- Focus indicators visible
- Escape to close modals/menus

## Browser Compatibility

### Supported Features
- CSS Grid & Flexbox
- CSS Custom Properties
- ES2020+ JavaScript
- Fetch API
- localStorage/sessionStorage

### Polyfills (if needed)
- None required for modern browsers
- Consider polyfill.io for IE11 (not recommended)

## Development Tools

### TypeScript Compiler
```bash
tsc --noEmit  # Type checking without output
```

### ESLint
```bash
eslint . --ext .ts,.tsx  # Linting
```

### Next.js Dev Server
```bash
next dev  # Fast Refresh, HMR, Error overlay
```

## Production Build

### Build Process
```bash
1. Type checking (tsc)
2. Linting (eslint)
3. Next.js build
   ├── Static optimization
   ├── Code splitting
   ├── Tree shaking
   ├── Minification
   └── Asset optimization
4. Output to .next/
```

### Output Structure
```
.next/
├── static/
│   ├── chunks/              # Code-split bundles
│   ├── css/                 # Extracted CSS
│   └── media/               # Optimized assets
├── server/                  # Server components
└── standalone/              # Docker-ready output
```

## Deployment Targets

### Vercel (Optimal)
- Zero-config
- Edge functions
- Analytics
- Preview deployments

### Static Export
```javascript
// next.config.js
output: 'export'
```
- GitHub Pages
- S3 + CloudFront
- Netlify
- Any static host

### Container
```dockerfile
FROM node:18-alpine
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

---

**Architecture Version**: 1.0.0
**Last Updated**: 2025-11-09
**Framework**: Next.js 14.1 App Router
