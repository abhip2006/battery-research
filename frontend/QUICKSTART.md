# Quick Start Guide

Get the Battery Intelligence Platform dashboard running in under 5 minutes.

## Prerequisites

- Node.js 18.17+ installed
- npm or yarn package manager

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd battery-research/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, Recharts, Tailwind CSS, and TypeScript.

### 3. Verify Data File

Ensure the data file is present:

```bash
ls public/data/visualization-data.json
```

If the file is missing, copy it from the parent directory:

```bash
mkdir -p public/data
cp ../visualization-data.json public/data/
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Battery Intelligence Platform dashboard!

## What You'll See

The dashboard includes:

- **Home Page** (`/`): Overview with key metrics and charts
- **Companies** (`/companies`): Searchable directory with filters
- **Map** (`/map`): State rankings and regional clusters
- **Technology** (`/technology`): Chemistry trends and performance data
- **Forecast** (`/forecast`): Market projections through 2030
- **Policy** (`/policy`): IRA impact and compliance timeline

## Common Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Features to Try

1. **Search Companies**: Go to `/companies` and search for "Tesla" or "LG"
2. **Filter by Technology**: Select LFP or NMC filters
3. **Toggle Dark Mode**: Click the moon/sun icon in the header
4. **Export Data**: Click Export button on Companies page
5. **View Charts**: Explore interactive charts on Technology page

## Troubleshooting

### Port Already in Use

If port 3000 is busy, specify a different port:

```bash
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

### Data Not Loading

Check browser console for errors. Verify data file path:
- Should be at: `public/data/visualization-data.json`
- URL should be: `/data/visualization-data.json`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize styling in `tailwind.config.ts`
- Add new pages in `src/app/`
- Extend data types in `src/types/index.ts`

## Need Help?

- Check the [README.md](./README.md) for comprehensive documentation
- Review code in `src/app/page.tsx` for examples
- Examine component structure in `src/components/`

Happy exploring! 🚀
