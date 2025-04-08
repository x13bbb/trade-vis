# Global Trade Visualization

An interactive web application for visualizing global trade flows between countries. This project uses D3.js to create force-directed graphs showing trade relationships, with the ability to drill down into country-specific data.

## Features

- Interactive network visualization of international trade relationships
- Directed graph with arrows showing trade flow direction
- Line thickness represents trade volume
- Country nodes are color-coded by region
- Click on countries to view detailed trade information
- Country detail view shows trade by category

## Tech Stack

- Next.js
- TypeScript
- D3.js for visualizations
- CSS Modules for styling

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/components/visualizations/`: D3.js visualization components
- `src/data/`: Sample trade data files
- `src/types/`: TypeScript type definitions
- `src/pages/`: Next.js pages
- `src/styles/`: CSS modules and global styles

## Data Structure

The application uses the following data structure:

- Country nodes with IDs, names, and regions
- Trade links with source, target, value, and direction
- Categorized trade data for country-specific view

## Future Development

- Add a timeline slider to view trade changes over years
- Integrate with real trade data API
- Add filtering by trade categories
- Implement search functionality for countries
- Add map visualization option
- Add import/export ratio visualizations

## Data Sources

Currently using sample data. Future versions will integrate with:

- UN Comtrade API
- World Bank Open Data
- Observatory of Economic Complexity (OEC)

## License

MIT
